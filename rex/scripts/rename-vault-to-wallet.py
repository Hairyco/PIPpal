"""Replace user-facing 'vault' with 'wallet'. Keeps StreamVault/YieldVault names."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGETS = [ROOT / "src", ROOT / "PLATFORM_FEES.md", ROOT / "PLATFORM_FEES.html"]

PAIRS = [
    ("Auto Marketing Vault", "Auto Marketing Wallet"),
    ("marketing vault", "marketing wallet"),
    ("Marketing vault", "Marketing wallet"),
    ("Marketing Vault", "Marketing wallet"),
    ("founder vault", "founder wallet"),
    ("Has vault", "Has wallet"),
    ("No vault", "No wallet"),
    ("add vault", "add wallet"),
    ("vault attach", "wallet attach"),
    ("Polessia vaults", "Polessia wallets"),
    ("Trader volume vault", "Trader volume wallet"),
    ("trader volume vault", "trader volume wallet"),
    ("trader cashback vault", "trader cashback wallet"),
    ("Protocol vault", "Protocol wallet"),
    ("Vault fill rate", "Wallet fill rate"),
    ("Vault fill", "Wallet fill"),
    ("Vault hit", "Wallet hit"),
    ("Vault can", "Wallet can"),
    ("vault fill rate", "wallet fill rate"),
    ("vault balance", "wallet balance"),
    ("Vault balance", "Wallet balance"),
    ("on-chain vault", "on-chain wallet"),
    ("curve SOL vault", "curve SOL wallet"),
    ("non-drainable marketing vault", "non-drainable marketing wallet"),
    ("Demo vault balance", "Demo wallet balance"),
    ("Demo marketing-vault", "Demo marketing-wallet"),
    ("marketing-vault", "marketing-wallet"),
    ("under-threshold vault", "under-threshold wallet"),
    ("PDA vaults", "PDA wallets"),
    ("vault PDA", "wallet PDA"),
    ("vault contract", "wallet contract"),
    ("vault pays", "wallet pays"),
    ("vault is empty", "wallet is empty"),
    ("vault fills", "wallet fills"),
    ("vault fill", "wallet fill"),
    ("fill this vault", "fill this wallet"),
    ("fill the vault", "fill the wallet"),
    ("fills the vault", "fills the wallet"),
    ("fills that vault", "fills that wallet"),
    ("funds the vault", "funds the wallet"),
    ("from the vault", "from the wallet"),
    ("into the vault", "into the wallet"),
    ("unlock the vault", "unlock the wallet"),
    ("if the vault", "if the wallet"),
    ("If the vault", "If the wallet"),
    ("When a vault", "When a wallet"),
    ("when a vault", "when a wallet"),
    ("a vault accumulates", "a wallet accumulates"),
    ("this vault", "this wallet"),
    ("the vault", "the wallet"),
    ("a vault", "a wallet"),
    ("without a vault", "without a wallet"),
    ("→ vault at", "→ wallet at"),
    ("new vault", "new wallet"),
    ("Yield vault", "Yield wallet"),
    ("Staking vault", "Staking wallet"),
    ("vault spend", "wallet spend"),
    ("/ vault ", "/ wallet "),
    (" vault.", " wallet."),
    (" vault,", " wallet,"),
    (" vault;", " wallet;"),
    (" vault ", " wallet "),
    (" vault\n", " wallet\n"),
    (' vault"', ' wallet"'),
    (" vault'", " wallet'"),
    (">Vault<", ">Wallet<"),
    ("Vault</", "Wallet</"),
    ('"Vault"', '"Wallet"'),
    ("Vault ", "Wallet "),
]


def iter_files() -> list[Path]:
    out: list[Path] = []
    for target in TARGETS:
        if target.is_file():
            out.append(target)
        elif target.is_dir():
            out.extend(target.rglob("*.ts"))
            out.extend(target.rglob("*.tsx"))
            out.extend(target.rglob("*.md"))
            out.extend(target.rglob("*.html"))
    return out


def transform(text: str) -> str:
    text = text.replace("StreamVault", "@@STREAMVAULT@@")
    text = text.replace("YieldVault", "@@YIELDVAULT@@")
    for old, new in PAIRS:
        text = text.replace(old, new)
    text = re.sub(r"(?<=>)Vault(?=<)", "Wallet", text)
    text = re.sub(r'(?<=")Vault(?=")', "Wallet", text)
    text = text.replace("@@STREAMVAULT@@", "StreamVault")
    text = text.replace("@@YIELDVAULT@@", "YieldVault")
    return text


def main() -> None:
    changed: list[str] = []
    for path in iter_files():
        original = path.read_text(encoding="utf-8")
        updated = transform(original)
        if updated != original:
            path.write_text(updated, encoding="utf-8", newline="\n")
            changed.append(str(path.relative_to(ROOT)))
    print(f"Updated {len(changed)} files")
    for item in changed:
        print(item)


if __name__ == "__main__":
    main()
