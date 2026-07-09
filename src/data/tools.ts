export interface Tool {
	name: string;
	desc: string;
	url: string;
	icon: string;
	group: 'calculator' | 'assessment';
}

export const TOOLS: Tool[] = [
	{
		name: '50/30/20 Budget Calculator',
		desc: 'Enter your take-home pay and see how much to spend on needs, wants, and savings each month.',
		url: '/tools/50-30-20-budget-calculator/',
		icon: '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/>',
		group: 'calculator',
	},
	{
		name: 'Biweekly & Weekly Paycheck Calculator',
		desc: 'Enter your take-home pay per paycheck and see your typical month, your extra-paycheck months, and a steady average to budget against.',
		url: '/tools/biweekly-paycheck-calculator/',
		icon: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
		group: 'calculator',
	},
	{
		name: 'Debt Strategy Comparison',
		desc: 'Compare avalanche vs. snowball payoff strategies and see how extra monthly payments affect each one differently.',
		url: '/tools/debt-snowball-vs-avalanche-calculator/',
		icon: '<line x1="6" y1="20" x2="6" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="18" y1="20" x2="18" y2="14"/>',
		group: 'calculator',
	},
	{
		name: 'Emergency Fund Calculator',
		desc: 'Enter your essential monthly expenses and see how much to keep saved for 3, 6, 9, or 12 months of coverage.',
		url: '/tools/emergency-fund-calculator/',
		icon: '<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2"/><circle cx="17" cy="10" r="1"/>',
		group: 'calculator',
	},
	{
		name: 'Sinking Fund Calculator',
		desc: 'Enter a target amount and target date to calculate exactly how much to save each month to hit your goal on time.',
		url: '/tools/sinking-fund-calculator/',
		icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
		group: 'calculator',
	},
	{
		name: 'Expense Tracking Readiness',
		desc: 'Answer 6 quick questions to find out if you have tracked enough spending to confidently build your first budget.',
		url: '/tools/expense-tracking-readiness/',
		icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12l2.5 2.5L16 9"/>',
		group: 'assessment',
	},
	{
		name: 'Sinking Fund Assessment',
		desc: 'Answer 5 quick questions to find out if your expense is a good fit for a sinking fund, an emergency fund, or your regular monthly budget.',
		url: '/tools/sinking-fund-assessment/',
		icon: '<circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/>',
		group: 'assessment',
	},
	{
		name: 'Find Your Budgeting Style',
		desc: 'Take our 60-second quiz to uncover your unique money personality and get one actionable tip to reach your goals faster.',
		url: '/quiz/budgeting-style/',
		icon: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
		group: 'assessment',
	},
];
