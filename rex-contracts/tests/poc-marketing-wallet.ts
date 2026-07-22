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

const PLATFORM_BPS = 35n;
const CREATOR_BPS = 15n;
const MARKETING_BPS = 40n;
const BPS = 10_000n;

function splitFees(gross: bigint) {
  const platform = (gross * PLATFORM_BPS) / BPS;
  const creator = (gross * CREATOR_BPS) / BPS;
  const marketing = (gross * MARKETING_BPS) / BPS;
  const net = gross - platform - creator - marketing;
  return { platform, creator, marketing, net };
}

describe('rex-mvp POC — marketing wallet + supplier disburse', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.RexMvp as Program<RexMvp>;
  const authority = provider.wallet as anchor.Wallet;

  const protocolTreasury = Keypair.generate();
  const supplier = Keypair.generate();
  const investor = Keypair.generate();

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
    await airdrop(protocolTreasury.publicKey, 0.01);

    [configPda] = PublicKey.findProgramAddressSync([Buffer.from('config')], program.programId);
  });

  it('initializes Rex config', async () => {
    await program.methods
      .initialize()
      .accounts({
        authority: authority.publicKey,
        protocolTreasury: protocolTreasury.publicKey,
        config: configPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const config = await program.account.rexConfig.fetch(configPda);
    expect(config.authority.toBase58()).to.equal(authority.publicKey.toBase58());
    expect(config.protocolTreasury.toBase58()).to.equal(protocolTreasury.publicKey.toBase58());
  });

  it('launches a project with marketing + creator + curve vaults', async () => {
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
      .launchProject(true)
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
    expect(project.mint.toBase58()).to.equal(mint.publicKey.toBase58());
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

  it('buy: splits 0.35% platform + 0.15% creator + 0.40% marketing (0.90% total)', async () => {
    const solIn = 1 * LAMPORTS_PER_SOL;
    const { platform, creator, marketing, net } = splitFees(BigInt(solIn));

    const treasuryBefore = await provider.connection.getBalance(protocolTreasury.publicKey);
    const creatorBefore = await provider.connection.getBalance(creatorVaultPda);
    const marketingBefore = await provider.connection.getBalance(marketingVaultPda);
    const curveBefore = await provider.connection.getBalance(curveVaultPda);

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
        creatorVault: creatorVaultPda,
        protocolTreasury: protocolTreasury.publicKey,
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

    expect(BigInt(treasuryAfter - treasuryBefore)).to.equal(platform);
    expect(BigInt(creatorAfter - creatorBefore)).to.equal(creator);
    expect(BigInt(marketingAfter - marketingBefore)).to.equal(marketing);
    expect(BigInt(curveAfter - curveBefore)).to.equal(net);

    const tokenBal = await provider.connection.getTokenAccountBalance(investorAta);
    expect(Number(tokenBal.value.amount)).to.be.greaterThan(0);
  });

  it('sell: taxes gross SOL — 0.35% platform + 0.15% creator + 0.40% marketing', async () => {
    const tokenBal = await provider.connection.getTokenAccountBalance(investorAta);
    const sellAmount = new anchor.BN(tokenBal.value.amount).div(new anchor.BN(2));

    const treasuryBefore = await provider.connection.getBalance(protocolTreasury.publicKey);
    const creatorBefore = await provider.connection.getBalance(creatorVaultPda);
    const marketingBefore = await provider.connection.getBalance(marketingVaultPda);
    const investorBefore = await provider.connection.getBalance(investor.publicKey);

    await program.methods
      .sell(sellAmount, new anchor.BN(0))
      .accounts({
        seller: investor.publicKey,
        project: projectPda,
        mint: mint.publicKey,
        sellerTokenAccount: investorAta,
        marketingVault: marketingVaultPda,
        creatorVault: creatorVaultPda,
        protocolTreasury: protocolTreasury.publicKey,
        config: configPda,
        curveVault: curveVaultPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([investor])
      .rpc();

    const treasuryAfter = await provider.connection.getBalance(protocolTreasury.publicKey);
    const creatorAfter = await provider.connection.getBalance(creatorVaultPda);
    const marketingAfter = await provider.connection.getBalance(marketingVaultPda);
    const investorAfter = await provider.connection.getBalance(investor.publicKey);

    const investorGain = BigInt(investorAfter - investorBefore);
    const platformGain = BigInt(treasuryAfter - treasuryBefore);
    const creatorGain = BigInt(creatorAfter - creatorBefore);
    const marketingGain = BigInt(marketingAfter - marketingBefore);

    expect(platformGain).to.be.greaterThan(0n);
    expect(creatorGain).to.be.greaterThan(0n);
    expect(marketingGain).to.be.greaterThan(0n);
    expect(investorGain).to.be.greaterThan(0n);

    // platform : marketing ≈ 35 : 40 = 0.875
    const ratio = Number(platformGain) / Number(marketingGain);
    expect(ratio).to.be.closeTo(0.875, 0.05);
  });

  it('founder withdraws creator fees to their wallet', async () => {
    const creatorBefore = await provider.connection.getBalance(creatorVaultPda);
    const founderBefore = await provider.connection.getBalance(authority.publicKey);
    expect(creatorBefore).to.be.greaterThan(0);

    const withdrawAmount = Math.floor(creatorBefore / 2);

    await program.methods
      .withdrawCreatorFees(new anchor.BN(withdrawAmount))
      .accounts({
        founder: authority.publicKey,
        project: projectPda,
        creatorVault: creatorVaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const creatorAfter = await provider.connection.getBalance(creatorVaultPda);
    const founderAfter = await provider.connection.getBalance(authority.publicKey);

    expect(creatorBefore - creatorAfter).to.equal(withdrawAmount);
    expect(founderAfter - founderBefore).to.equal(withdrawAmount);
  });

  it('whitelists supplier wallet', async () => {
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

    const entry = await program.account.whitelistedProvider.fetch(whitelistPda);
    expect(entry.active).to.equal(true);
    expect(entry.provider.toBase58()).to.equal(supplier.publicKey.toBase58());
  });

  it('disburses marketing SOL to whitelisted supplier', async () => {
    const disburseAmount = 0.01 * LAMPORTS_PER_SOL;
    const supplierBefore = await provider.connection.getBalance(supplier.publicKey);
    const marketingBefore = await provider.connection.getBalance(marketingVaultPda);

    await program.methods
      .disburseMarketing(new anchor.BN(disburseAmount))
      .accounts({
        authority: authority.publicKey,
        config: configPda,
        project: projectPda,
        whitelistEntry: whitelistPda,
        marketingVault: marketingVaultPda,
        supplier: supplier.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const supplierAfter = await provider.connection.getBalance(supplier.publicKey);
    const marketingAfter = await provider.connection.getBalance(marketingVaultPda);

    expect(supplierAfter - supplierBefore).to.equal(disburseAmount);
    expect(marketingBefore - marketingAfter).to.equal(disburseAmount);
  });

  it('rejects disburse to non-whitelisted wallet', async () => {
    const randomWallet = Keypair.generate();
    const [badWhitelist] = PublicKey.findProgramAddressSync(
      [Buffer.from('whitelist'), randomWallet.publicKey.toBuffer()],
      program.programId,
    );

    try {
      await program.methods
        .disburseMarketing(new anchor.BN(1000))
        .accounts({
          authority: authority.publicKey,
          config: configPda,
          project: projectPda,
          whitelistEntry: badWhitelist,
          marketingVault: marketingVaultPda,
          supplier: randomWallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      expect.fail('should have thrown');
    } catch (err) {
      expect(String(err)).to.match(/ProviderNotWhitelisted|AccountNotInitialized|Constraint/);
    }
  });
});
