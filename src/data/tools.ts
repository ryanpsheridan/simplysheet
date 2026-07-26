export interface Tool {
	name: string;
	desc: string;
	url: string;
	icon: string;
	/** Large line-art illustration (viewBox 0 0 240 160) for thumbnail cards. */
	illustration: string;
	group: 'calculator' | 'assessment';
}

export const TOOLS: Tool[] = [
	{
		name: '50/30/20 Budget Calculator',
		desc: 'Enter your take-home pay and see how much to spend on needs, wants, and savings each month.',
		url: '/tools/50-30-20-budget-calculator/',
		icon: '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/>',
		illustration: `
			<line x1="40" y1="35" x2="40" y2="125" stroke-width="1" opacity="0.25"/>
			<line x1="40" y1="55" x2="170" y2="55" stroke-width="3" opacity="0.9"/>
			<line x1="40" y1="80" x2="130" y2="80" stroke-width="3" opacity="0.6"/>
			<line x1="40" y1="105" x2="95" y2="105" stroke-width="3" opacity="0.4"/>
			<circle cx="170" cy="55" r="7" opacity="0.15" fill="currentColor" stroke="none"/>
			<circle cx="170" cy="55" r="2.5" fill="currentColor" stroke="none"/>
			<circle cx="130" cy="80" r="6" opacity="0.15" fill="currentColor" stroke="none"/>
			<circle cx="130" cy="80" r="2.2" fill="currentColor" stroke="none"/>
			<circle cx="95" cy="105" r="5" opacity="0.15" fill="currentColor" stroke="none"/>
			<circle cx="95" cy="105" r="2" fill="currentColor" stroke="none"/>
		`,
		group: 'calculator',
	},
	{
		name: 'Biweekly & Weekly Paycheck Calculator',
		desc: 'Enter your take-home pay per paycheck and see your typical month, your extra-paycheck months, and a steady average to budget against.',
		url: '/tools/biweekly-paycheck-calculator/',
		icon: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
		illustration: `
			<line x1="50" y1="120" x2="190" y2="120" stroke-width="1" opacity="0.25"/>
			<line x1="50" y1="82" x2="190" y2="82" stroke-width="1" stroke-dasharray="4 4" opacity="0.3"/>
			<line x1="60" y1="120" x2="60" y2="90" stroke-width="2" opacity="0.6"/>
			<line x1="95" y1="120" x2="95" y2="75" stroke-width="2" opacity="0.75"/>
			<line x1="130" y1="120" x2="130" y2="60" stroke-width="2" opacity="0.9"/>
			<line x1="165" y1="120" x2="165" y2="75" stroke-width="2" opacity="0.75"/>
			<circle cx="60" cy="90" r="4" opacity="0.15" fill="currentColor" stroke="none"/>
			<circle cx="60" cy="90" r="1.5" fill="currentColor" stroke="none"/>
			<circle cx="95" cy="75" r="5" opacity="0.18" fill="currentColor" stroke="none"/>
			<circle cx="95" cy="75" r="1.8" fill="currentColor" stroke="none"/>
			<circle cx="130" cy="60" r="8" opacity="0.22" fill="currentColor" stroke="none"/>
			<circle cx="130" cy="60" r="3" fill="currentColor" stroke="none"/>
			<circle cx="165" cy="75" r="5" opacity="0.18" fill="currentColor" stroke="none"/>
			<circle cx="165" cy="75" r="1.8" fill="currentColor" stroke="none"/>
		`,
		group: 'calculator',
	},
	{
		name: 'Bill Split Calculator',
		desc: 'Enter both take-home incomes and your shared bills to compare a 50/50 split with a fair split weighted by income.',
		url: '/tools/bill-split-calculator/',
		icon: '<circle cx="7" cy="8" r="3"/><circle cx="17" cy="8" r="3"/><path d="M2 20c0-2.8 2.2-5 5-5s5 2.2 5 5"/><path d="M12 20c0-2.8 2.2-5 5-5s5 2.2 5 5"/>',
		illustration: `
			<line x1="50" y1="55" x2="115" y2="55" stroke-width="4" opacity="0.85"/>
			<line x1="115" y1="55" x2="190" y2="55" stroke-width="4" opacity="0.4"/>
			<line x1="115" y1="47" x2="115" y2="63" stroke-width="1" opacity="0.3"/>
			<path d="M75 60 C 75 75, 75 85, 75 95" stroke-width="1" stroke-dasharray="3 3" opacity="0.35"/>
			<path d="M155 60 C 155 75, 155 85, 155 95" stroke-width="1" stroke-dasharray="3 3" opacity="0.35"/>
			<circle cx="75" cy="107" r="6" opacity="0.15" fill="currentColor" stroke="none"/>
			<circle cx="75" cy="107" r="2.2" fill="currentColor" stroke="none"/>
			<circle cx="155" cy="107" r="9" opacity="0.2" fill="currentColor" stroke="none"/>
			<circle cx="155" cy="107" r="3.2" fill="currentColor" stroke="none"/>
		`,
		group: 'calculator',
	},
	{
		name: 'Debt Strategy Comparison',
		desc: 'Compare avalanche vs. snowball payoff strategies and see how extra monthly payments affect each one differently.',
		url: '/tools/debt-snowball-vs-avalanche-calculator/',
		icon: '<line x1="6" y1="20" x2="6" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="18" y1="20" x2="18" y2="14"/>',
		illustration: `
			<line x1="50" y1="130" x2="200" y2="130" stroke-width="1" opacity="0.2"/>
			<path d="M50 40 C 70 75, 95 110, 150 130" stroke-width="2" opacity="0.9"/>
			<path d="M50 40 C 130 42, 180 70, 200 130" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.5"/>
			<circle cx="50" cy="40" r="6" opacity="0.15" fill="currentColor" stroke="none"/>
			<circle cx="50" cy="40" r="2.2" fill="currentColor" stroke="none"/>
			<circle cx="150" cy="130" r="7" opacity="0.2" fill="currentColor" stroke="none"/>
			<circle cx="150" cy="130" r="2.5" fill="currentColor" stroke="none"/>
			<circle cx="200" cy="130" r="5" opacity="0.15" fill="currentColor" stroke="none"/>
			<circle cx="200" cy="130" r="2" fill="currentColor" stroke="none"/>
		`,
		group: 'calculator',
	},
	{
		name: 'Emergency Fund Calculator',
		desc: 'Enter your essential monthly expenses and see how much to keep saved for 3, 6, 9, or 12 months of coverage.',
		url: '/tools/emergency-fund-calculator/',
		icon: '<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2"/><circle cx="17" cy="10" r="1"/>',
		illustration: `
			<line x1="50" y1="125" x2="190" y2="125" stroke-width="1" opacity="0.25"/>
			<line x1="50" y1="65" x2="190" y2="65" stroke-width="1" stroke-dasharray="4 4" opacity="0.35"/>
			<line x1="65" y1="125" x2="65" y2="105" stroke-width="3" opacity="0.4"/>
			<line x1="105" y1="125" x2="105" y2="85" stroke-width="3" opacity="0.6"/>
			<line x1="145" y1="125" x2="145" y2="65" stroke-width="3" opacity="0.9"/>
			<line x1="185" y1="125" x2="185" y2="45" stroke-width="3" opacity="0.4"/>
			<circle cx="65" cy="105" r="4" opacity="0.15" fill="currentColor" stroke="none"/>
			<circle cx="65" cy="105" r="1.5" fill="currentColor" stroke="none"/>
			<circle cx="105" cy="85" r="5" opacity="0.18" fill="currentColor" stroke="none"/>
			<circle cx="105" cy="85" r="1.8" fill="currentColor" stroke="none"/>
			<circle cx="145" cy="65" r="8" opacity="0.25" fill="currentColor" stroke="none"/>
			<circle cx="145" cy="65" r="3" fill="currentColor" stroke="none"/>
			<circle cx="185" cy="45" r="4" opacity="0.15" fill="currentColor" stroke="none"/>
			<circle cx="185" cy="45" r="1.5" fill="currentColor" stroke="none"/>
		`,
		group: 'calculator',
	},
	{
		name: 'Sinking Fund Calculator',
		desc: 'Enter a target amount and target date to calculate exactly how much to save each month to hit your goal on time.',
		url: '/tools/sinking-fund-calculator/',
		icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
		illustration: `
			<circle cx="120" cy="80" r="45" stroke-width="1.5" opacity="0.2"/>
			<circle cx="120" cy="80" r="30" stroke-width="1.5" opacity="0.3"/>
			<circle cx="120" cy="80" r="15" stroke-width="1.5" opacity="0.4"/>
			<line x1="120" y1="80" x2="120" y2="55" stroke-width="2" opacity="0.85"/>
			<circle cx="120" cy="80" r="3" fill="currentColor" stroke="none"/>
			<circle cx="120" cy="55" r="4" opacity="0.2" fill="currentColor" stroke="none"/>
			<circle cx="120" cy="55" r="1.6" fill="currentColor" stroke="none"/>
			<circle cx="120" cy="35" r="7" opacity="0.25" fill="currentColor" stroke="none"/>
			<circle cx="120" cy="35" r="2.5" fill="currentColor" stroke="none"/>
		`,
		group: 'calculator',
	},
	{
		name: 'Expense Tracking Readiness',
		desc: 'Answer 6 quick questions to find out if you have tracked enough spending to confidently build your first budget.',
		url: '/tools/expense-tracking-readiness/',
		icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12l2.5 2.5L16 9"/>',
		illustration: `
			<line x1="70" y1="80" x2="110" y2="80" stroke-width="2" opacity="0.85"/>
			<line x1="110" y1="80" x2="150" y2="80" stroke-width="2" opacity="0.85"/>
			<line x1="150" y1="80" x2="190" y2="80" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.4"/>
			<circle cx="70" cy="80" r="6" opacity="0.15" fill="currentColor" stroke="none"/>
			<circle cx="70" cy="80" r="2.2" fill="currentColor" stroke="none"/>
			<path d="M64 68 L68 72 L76 62" stroke-width="1.5" opacity="0.9"/>
			<circle cx="110" cy="80" r="6" opacity="0.15" fill="currentColor" stroke="none"/>
			<circle cx="110" cy="80" r="2.2" fill="currentColor" stroke="none"/>
			<path d="M104 68 L108 72 L116 62" stroke-width="1.5" opacity="0.9"/>
			<circle cx="150" cy="80" r="6" opacity="0.15" fill="currentColor" stroke="none"/>
			<circle cx="150" cy="80" r="2.2" fill="currentColor" stroke="none"/>
			<path d="M144 68 L148 72 L156 62" stroke-width="1.5" opacity="0.9"/>
			<circle cx="190" cy="80" r="6" stroke-width="1.5" opacity="0.35" fill="none"/>
		`,
		group: 'assessment',
	},
	{
		name: 'Sinking Fund Assessment',
		desc: 'Answer 5 quick questions to find out if your expense is a good fit for a sinking fund, an emergency fund, or your regular monthly budget.',
		url: '/tools/sinking-fund-assessment/',
		icon: '<circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/>',
		illustration: `
			<circle cx="65" cy="80" r="7" opacity="0.2" fill="currentColor" stroke="none"/>
			<circle cx="65" cy="80" r="2.5" fill="currentColor" stroke="none"/>
			<path d="M72 76 C 110 55, 140 45, 175 40" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.45"/>
			<path d="M72 84 C 110 105, 140 115, 175 120" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.45"/>
			<line x1="72" y1="80" x2="185" y2="80" stroke-width="2" opacity="0.9"/>
			<circle cx="175" cy="40" r="5" opacity="0.15" fill="currentColor" stroke="none"/>
			<circle cx="175" cy="40" r="2" fill="currentColor" stroke="none"/>
			<circle cx="175" cy="120" r="5" opacity="0.15" fill="currentColor" stroke="none"/>
			<circle cx="175" cy="120" r="2" fill="currentColor" stroke="none"/>
			<circle cx="185" cy="80" r="7" opacity="0.25" fill="currentColor" stroke="none"/>
			<circle cx="185" cy="80" r="2.5" fill="currentColor" stroke="none"/>
		`,
		group: 'assessment',
	},
	{
		name: 'Find Your Budgeting Style',
		desc: 'Take our 60-second quiz to uncover your unique money personality and get one actionable tip to reach your goals faster.',
		url: '/quiz/budgeting-style/',
		icon: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
		illustration: `
			<line x1="120" y1="80" x2="120" y2="35" stroke-width="1" stroke-dasharray="4 4" opacity="0.3"/>
			<line x1="120" y1="80" x2="165" y2="80" stroke-width="1" stroke-dasharray="4 4" opacity="0.3"/>
			<line x1="120" y1="80" x2="120" y2="125" stroke-width="1" stroke-dasharray="4 4" opacity="0.3"/>
			<line x1="120" y1="80" x2="75" y2="80" stroke-width="2" opacity="0.9"/>
			<circle cx="120" cy="80" r="3" fill="currentColor" stroke="none"/>
			<circle cx="120" cy="35" r="4" opacity="0.15" fill="currentColor" stroke="none"/>
			<circle cx="120" cy="35" r="1.6" fill="currentColor" stroke="none"/>
			<circle cx="165" cy="80" r="4" opacity="0.15" fill="currentColor" stroke="none"/>
			<circle cx="165" cy="80" r="1.6" fill="currentColor" stroke="none"/>
			<circle cx="120" cy="125" r="4" opacity="0.15" fill="currentColor" stroke="none"/>
			<circle cx="120" cy="125" r="1.6" fill="currentColor" stroke="none"/>
			<circle cx="75" cy="80" r="7" opacity="0.25" fill="currentColor" stroke="none"/>
			<circle cx="75" cy="80" r="2.5" fill="currentColor" stroke="none"/>
		`,
		group: 'assessment',
	},
];
