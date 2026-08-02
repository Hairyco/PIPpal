import { Link } from 'react-router-dom';
import { ScoutDashboard } from './scout/ScoutDashboard';

type PostLaunchAffiliateTabProps = {
  symbol: string;
  tokenPageUrl: string;
  telegramInvite?: string | null;
  primaryBtnClass: string;
  backBtnClass: string;
};

export function PostLaunchAffiliateTab({
  symbol,
  backBtnClass,
}: PostLaunchAffiliateTabProps) {
  return (
    <div className="space-y-8">
      <ScoutDashboard symbol={symbol} />
      <Link to="/affiliates" className={backBtnClass}>
        Browse raid coins
      </Link>
    </div>
  );
}
