import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from '@solana/web3.js';
import { expect } from 'chai';
import { RexMvp } from '../target/types/rex_mvp';

const BPS = 10_000n;
const ENGINE_LAUNCH = 0;
const ENGINE_LIST = 1;

function splitLaunch(gross: bigint, hasReferrer: boolean) {
  const raid = (gross * 50n) / BPS;
  const marketing = (gross * 30n) / BPS;
  const creator = (gross * 20n) / BPS;
  let platform = (gross * 30n) / BPS;
  const raidOut = hasReferrer ? raid : 0n;
  if (!hasReferrer) platform += raid;
  const net = gross - raidOut - marketing - creator - platform;
  return { raid: raidOut, marketing, creator, platform, net };
}

describe('rex-mvp — CTOgo marketing wallet + dual fee engines', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.RexMvp as Program<RexMvp>;
  const authority = provider.wallet as anchor.Wallet;

  const protocolTreasury = Keypair.generate();
  const keeper = Keypair.generate();
  const supplier = Keypair.generate();
  const investor = Keypair.generate();
  const raider = Keypair.generate();
  const mint = Keypair.generate();

  let configPda: PublicKey;
  let projectPda: PublicKey;
  let marketingVaultPda: PublicKey;
  let creatorVaultPda: PublicKey;
  let curveVaultPda: PublicKey;
  let whitelistPda: PublicKey;
  let investorAta: PublicKey;

  before(async () => {
    const airdrop = async (pk: PublicKey, sol = 5) => {
      const sig = await provider.connection.requestAirdrop(pk, sol * LAMPORTS_PER_SOL);
      await provider.connection.confirmTransaction(sig);
    };

    await airdrop(authority.publicKey, 10);
    await airdrop(investor.publicKey, 10);
    await airdrop(keeper.publicKey, 2);
    await airdrop(raider.publicKey, 0.01);
    await airdrop(protocolTreasury.publicKey, 0.01);

    [configPda] = PublicKey.findProgramAddressSync([Buffer.from('config')], program.programId);
  });

  it('initializes CTOgo config with keeper', async () => {
    await program.methods
      .initialize()
      .accounts({
        authority: authority.publicKey,
        protocolTreasury: protocolTreasury.publicKey,
        keeper: keeper.publicKey,
        config: configPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const config = await program.account.rexConfig.fetch(configPda);
    expect(config.authority.toBase58()).to.equal(authority.publicKey.toBase58());
    expect(config.protocolTreasury.toBase58()).to.equal(protocolTreasury.publicKey.toBase58());
    expect(config.keeper.toBase58()).to.equal(keeper.publicKey.toBase58());
    expect(config.paused).to.equal(false);
  });

  it('launches a Launch-engine project (MW attached)', async () => {
    [projectPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('project'), mint.publicKey.toBuffer()],
      program.programId,
    );
    [marketingVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('marketing_vault'), projectPda.toBuffer()],
      program.programId,
    );
    [creatorVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('creator_vault'), projectPda.toBuffer()],
      program.programId,
    );
    [curveVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('curve_vault'), projectPda.toBuffer()],
      program.programId,
    );
    const [mintAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from('mint_auth'), projectPda.toBuffer()],
      program.programId,
    );

    await program.methods
      .launchProject(true, 0, ENGINE_LAUNCH)
      .accounts({
        founder: authority.publicKey,
        config: configPda,
        project: projectPda,
        mint: mint.publicKey,
        mintAuthority,
        marketingVault: marketingVaultPda,
        creatorVault: creatorVaultPda,
        curveVault: curveVaultPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([mint])
      .rpc();

    const project = await program.account.project.fetch(projectPda);
    expect(project.tradingEnabled).to.equal(true);
    expect(project.engine).to.equal(ENGINE_LAUNCH);
    expect(project.marketingAttached).to.equal(true);
  });

  it('creates investor token account', async () => {
    investorAta = getAssociatedTokenAddressSync(mint.publicKey, investor.publicKey);
    const ix = createAssociatedTokenAccountInstruction(
      investor.publicKey,
      investorAta,
      investor.publicKey,
      mint.publicKey,
    );
    const tx = new anchor.web3.Transaction().add(ix);
    await provider.sendAndConfirm(tx, [investor]);
  });

  it('buy Launch: 1.30% with raid referrer', async () => {
    const solIn = 1 * LAMPORTS_PER_SOL;
    const { raid, marketing, creator, platform, net } = splitLaunch(BigInt(solIn), true);

    const treasuryBefore = await provider.connection.getBalance(protocolTreasury.publicKey);
    const creatorBefore = await provider.connection.getBalance(creatorVaultPda);
    const marketingBefore = await provider.connection.getBalance(marketingVaultPda);
    const curveBefore = await provider.connection.getBalance(curveVaultPda);
    const raiderBefore = await provider.connection.getBalance(raider.publicKey);

    const [mintAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from('mint_auth'), projectPda.toBuffer()],
      program.programId,
    );

    await program.methods
      .buy(new anchor.BN(solIn), new anchor.BN(0))
      .accounts({
        buyer: investor.publicKey,
        project: projectPda,
        mint: mint.publicKey,
        buyerTokenAccount: investorAta,
        marketingVault: marketingVaultPda,
        marketingDestination: marketingVaultPda,
        creatorVault: creatorVaultPda,
        protocolTreasury: protocolTreasury.publicKey,
        raider: raider.publicKey,
        config: configPda,
        curveVault: curveVaultPda,
        mintAuthority,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([investor])
      .rpc();

    const treasuryAfter = await provider.connection.getBalance(protocolTreasury.publicKey);
    const creatorAfter = await provider.connection.getBalance(creatorVaultPda);
    const marketingAfter = await provider.connection.getBalance(marketingVaultPda);
    const curveAfter = await provider.connection.getBalance(curveVaultPda);
    const raiderAfter = await provider.connection.getBalance(raider.publicKey);

    expect(BigInt(treasuryAfter - treasuryBefore)).to.equal(platform);
    expect(BigInt(creatorAfter - creatorBefore)).to.equal(creator);
    expect(BigInt(marketingAfter - marketingBefore)).to.equal(marketing);
    expect(BigInt(curveAfter - curveBefore)).to.equal(net);
    expect(BigInt(raiderAfter - raiderBefore)).to.equal(raid);
  });

  it('sell Launch: taxes gross SOL with unclaimed raid → treasury', async () => {
    const tokenBal = await provider.connection.getTokenAccountBalance(investorAta);
    const sellAmount = new anchor.BN(tokenBal.value.amount).div(new anchor.BN(2));

    const treasuryBefore = await provider.connection.getBalance(protocolTreasury.publicKey);
    const marketingBefore = await provider.connection.getBalance(marketingVaultPda);

    await program.methods
      .sell(sellAmount, new anchor.BN(0))
      .accounts({
        seller: investor.publicKey,
        project: projectPda,
        mint: mint.publicKey,
        sellerTokenAccount: investorAta,
        marketingVault: marketingVaultPda,
        marketingDestination: marketingVaultPda,
        creatorVault: creatorVaultPda,
        protocolTreasury: protocolTreasury.publicKey,
        raider: protocolTreasury.publicKey,
        config: configPda,
        curveVault: curveVaultPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([investor])
      .rpc();

    const treasuryAfter = await provider.connection.getBalance(protocolTreasury.publicKey);
    const marketingAfter = await provider.connection.getBalance(marketingVaultPda);
    expect(treasuryAfter).to.be.greaterThan(treasuryBefore);
    expect(marketingAfter).to.be.greaterThan(marketingBefore);
  });

  it('whitelists supplier and supports deactivate', async () => {
    [whitelistPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('whitelist'), supplier.publicKey.toBuffer()],
      program.programId,
    );

    await program.methods
      .addWhitelistProvider()
      .accounts({
        authority: authority.publicKey,
        provider: supplier.publicKey,
        config: configPda,
        whitelistEntry: whitelistPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await program.methods
      .setWhitelistActive(false)
      .accounts({
        authority: authority.publicKey,
        provider: supplier.publicKey,
        config: configPda,
        whitelistEntry: whitelistPda,
      })
      .rpc();

    let entry = await program.account.whitelistedProvider.fetch(whitelistPda);
    expect(entry.active).to.equal(false);

    await program.methods
      .setWhitelistActive(true)
      .accounts({
        authority: authority.publicKey,
        provider: supplier.publicKey,
        config: configPda,
        whitelistEntry: whitelistPda,
      })
      .rpc();
    entry = await program.account.whitelistedProvider.fetch(whitelistPda);
    expect(entry.active).to.equal(true);
  });

  it('disburses invoice + 20% on top; replay is rejected', async () => {
    const invoice = 0.01 * LAMPORTS_PER_SOL;
    const serviceFee = Math.floor((invoice * 2000) / 10_000);
    const total = invoice + serviceFee;
    const invoiceId = Buffer.alloc(32, 7);

    const [receiptPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('disburse'), projectPda.toBuffer(), invoiceId],
      program.programId,
    );

    const supplierBefore = await provider.connection.getBalance(supplier.publicKey);
    const treasuryBefore = await provider.connection.getBalance(protocolTreasury.publicKey);
    const marketingBefore = await provider.connection.getBalance(marketingVaultPda);

    await program.methods
      .disburseMarketing([...invoiceId] as number[], new anchor.BN(invoice))
      .accounts({
        authority: keeper.publicKey,
        config: configPda,
        project: projectPda,
        whitelistEntry: whitelistPda,
        marketingVault: marketingVaultPda,
        supplier: supplier.publicKey,
        protocolTreasury: protocolTreasury.publicKey,
        receipt: receiptPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([keeper])
      .rpc();

    const supplierAfter = await provider.connection.getBalance(supplier.publicKey);
    const treasuryAfter = await provider.connection.getBalance(protocolTreasury.publicKey);
    const marketingAfter = await provider.connection.getBalance(marketingVaultPda);

    expect(supplierAfter - supplierBefore).to.equal(invoice);
    expect(treasuryAfter - treasuryBefore).to.equal(serviceFee);
    expect(marketingBefore - marketingAfter).to.equal(total);

    try {
      await program.methods
        .disburseMarketing([...invoiceId] as number[], new anchor.BN(invoice))
        .accounts({
          authority: authority.publicKey,
          config: configPda,
          project: projectPda,
          whitelistEntry: whitelistPda,
          marketingVault: marketingVaultPda,
          supplier: supplier.publicKey,
          protocolTreasury: protocolTreasury.publicKey,
          receipt: receiptPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      expect.fail('replay should fail');
    } catch (err) {
      expect(String(err)).to.match(/already in use|AlreadyDisbursed|0x0/);
    }
  });

  it('spend pause blocks disburse', async () => {
    await program.methods
      .setSpendPaused(true)
      .accounts({
        actor: authority.publicKey,
        config: configPda,
        project: projectPda,
      })
      .rpc();

    const invoiceId = Buffer.alloc(32, 9);
    const [receiptPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('disburse'), projectPda.toBuffer(), invoiceId],
      program.programId,
    );

    try {
      await program.methods
        .disburseMarketing([...invoiceId] as number[], new anchor.BN(1000))
        .accounts({
          authority: authority.publicKey,
          config: configPda,
          project: projectPda,
          whitelistEntry: whitelistPda,
          marketingVault: marketingVaultPda,
          supplier: supplier.publicKey,
          protocolTreasury: protocolTreasury.publicKey,
          receipt: receiptPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      expect.fail('should be paused');
    } catch (err) {
      expect(String(err)).to.match(/SpendPaused/);
    }

    await program.methods
      .setSpendPaused(false)
      .accounts({
        actor: authority.publicKey,
        config: configPda,
        project: projectPda,
      })
      .rpc();
  });

  it('rejects early inactivity sweep', async () => {
    try {
      await program.methods
        .sweepInactiveMarketing()
        .accounts({
          authority: authority.publicKey,
          config: configPda,
          project: projectPda,
          marketingVault: marketingVaultPda,
          protocolTreasury: protocolTreasury.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      expect.fail('sweep should not be due');
    } catch (err) {
      expect(String(err)).to.match(/SweepNotDue/);
    }
  });

  it('List project routes marketing to treasury until attach', async () => {
    const listMint = Keypair.generate();
    const listInvestor = Keypair.generate();
    const sig = await provider.connection.requestAirdrop(
      listInvestor.publicKey,
      5 * LAMPORTS_PER_SOL,
    );
    await provider.connection.confirmTransaction(sig);

    const [listProject] = PublicKey.findProgramAddressSync(
      [Buffer.from('project'), listMint.publicKey.toBuffer()],
      program.programId,
    );
    const [listMw] = PublicKey.findProgramAddressSync(
      [Buffer.from('marketing_vault'), listProject.toBuffer()],
      program.programId,
    );
    const [listCreator] = PublicKey.findProgramAddressSync(
      [Buffer.from('creator_vault'), listProject.toBuffer()],
      program.programId,
    );
    const [listCurve] = PublicKey.findProgramAddressSync(
      [Buffer.from('curve_vault'), listProject.toBuffer()],
      program.programId,
    );
    const [listMintAuth] = PublicKey.findProgramAddressSync(
      [Buffer.from('mint_auth'), listProject.toBuffer()],
      program.programId,
    );

    await program.methods
      .launchProject(true, 0, ENGINE_LIST)
      .accounts({
        founder: authority.publicKey,
        config: configPda,
        project: listProject,
        mint: listMint.publicKey,
        mintAuthority: listMintAuth,
        marketingVault: listMw,
        creatorVault: listCreator,
        curveVault: listCurve,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([listMint])
      .rpc();

    const project = await program.account.project.fetch(listProject);
    expect(project.engine).to.equal(ENGINE_LIST);
    expect(project.marketingAttached).to.equal(false);

    const ata = getAssociatedTokenAddressSync(listMint.publicKey, listInvestor.publicKey);
    const ix = createAssociatedTokenAccountInstruction(
      listInvestor.publicKey,
      ata,
      listInvestor.publicKey,
      listMint.publicKey,
    );
    await provider.sendAndConfirm(new anchor.web3.Transaction().add(ix), [listInvestor]);

    const treasuryBefore = await provider.connection.getBalance(protocolTreasury.publicKey);
    const mwBefore = await provider.connection.getBalance(listMw);
    const solIn = 1 * LAMPORTS_PER_SOL;
    const expectedMkt = Math.floor((solIn * 40) / 10_000);

    await program.methods
      .buy(new anchor.BN(solIn), new anchor.BN(0))
      .accounts({
        buyer: listInvestor.publicKey,
        project: listProject,
        mint: listMint.publicKey,
        buyerTokenAccount: ata,
        marketingVault: listMw,
        marketingDestination: protocolTreasury.publicKey,
        creatorVault: listCreator,
        protocolTreasury: protocolTreasury.publicKey,
        raider: protocolTreasury.publicKey,
        config: configPda,
        curveVault: listCurve,
        mintAuthority: listMintAuth,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([listInvestor])
      .rpc();

    const treasuryAfter = await provider.connection.getBalance(protocolTreasury.publicKey);
    const mwAfter = await provider.connection.getBalance(listMw);
    // platform (35) + unclaimed raid (50) + marketing (40) = 125 bps to treasury path
    expect(treasuryAfter - treasuryBefore).to.be.greaterThanOrEqual(expectedMkt);
    expect(mwAfter).to.equal(mwBefore);

    await program.methods
      .attachMarketingWallet()
      .accounts({
        founder: authority.publicKey,
        project: listProject,
        marketingVault: listMw,
      })
      .rpc();

    const attached = await program.account.project.fetch(listProject);
    expect(attached.marketingAttached).to.equal(true);
  });
});
