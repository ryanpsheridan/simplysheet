export interface ToolMockSpec {
	/** Input fields, label and filled-in value. */
	fields?: { label: string; value: string }[];
	/** A pill toggle row (e.g. months of coverage), with the selected index. */
	chips?: { options: string[]; selected: number };
	/** Assessments: the question and its answer tiles, one selected. */
	question?: string;
	options?: string[];
	selected?: number;
	/** The hero result card. */
	result?: { label: string; value: string };
	/** Supporting label/value rows under the result. */
	rows?: [string, string][];
	/** Horizontal bars: `tone` picks a calculator colour token. */
	bars?: { label: string; value: string; pct: number; tone: 'info' | 'caution' | 'positive' | 'avalanche' | 'snowball' }[];
}

export interface Tool {
	name: string;
	desc: string;
	url: string;
	icon: string;
	/** A miniature of the tool's UI, drawn by ToolMock on the tool's card and
	    the homepage preview stage. Sample inputs with their worked outputs,
	    so the numbers agree with what the real tool would show. */
	mock: ToolMockSpec;
	group: 'calculator' | 'assessment';
}

// The last path segment of a tool's URL, used as its id in `data-cta` values
// (`tool_thumb_card:<id>`, `index_tools_item:<id>`, ...).
export function toolId(tool: Pick<Tool, 'url'>): string {
	return tool.url.replace(/\/$/, '').split('/').pop() ?? tool.url;
}

export const TOOLS: Tool[] = [
	{
		name: '50/30/20 Budget Calculator',
		desc: 'Enter your take-home pay and see how much to spend on needs, wants, and savings each month.',
		url: '/tools/50-30-20-budget-calculator/',
		icon: '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/>',
		group: 'calculator',
		mock: {
			fields: [
				{ label: 'Monthly take-home pay', value: '$4,800' },
			],
			bars: [
				{ label: 'Needs', value: '$2,400', pct: 50, tone: 'info' },
				{ label: 'Wants', value: '$1,440', pct: 30, tone: 'caution' },
				{ label: 'Savings', value: '$960', pct: 20, tone: 'positive' },
			],
		},
	},
	{
		name: 'Biweekly Paycheck Calculator',
		desc: 'Paid every two weeks? See your typical two-paycheck month, your two three-paycheck months, and a steady average to budget against.',
		url: '/tools/biweekly-paycheck-calculator/',
		icon: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
		group: 'calculator',
		mock: {
			fields: [
				{ label: 'Paycheck amount', value: '$1,850' },
				{ label: 'First payday', value: 'Jan 9, 2026' },
			],
			result: { label: 'Typical month', value: '$3,700' },
			rows: [
				['Three-paycheck months', '$5,550'],
				['Monthly average', '$4,008'],
			],
		},
	},
	{
		name: 'Weekly Paycheck Calculator',
		desc: 'Paid every week? See your typical four-paycheck month, your four five-paycheck months, and a steady average to budget against.',
		url: '/tools/weekly-paycheck-calculator/',
		icon: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="7" y1="14" x2="17" y2="14"/><line x1="7" y1="18" x2="17" y2="18"/>',
		group: 'calculator',
		mock: {
			fields: [
				{ label: 'Paycheck amount', value: '$925' },
				{ label: 'First payday', value: 'Jan 2, 2026' },
			],
			result: { label: 'Typical month', value: '$3,700' },
			rows: [
				['Five-paycheck months', '$4,625'],
				['Monthly average', '$4,008'],
			],
		},
	},
	{
		name: 'Semi-Monthly Paycheck Calculator',
		desc: 'Paid twice a month on fixed dates? See your monthly and annual income from 24 paychecks, and how it differs from biweekly pay.',
		url: '/tools/semi-monthly-paycheck-calculator/',
		icon: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="9" cy="15.5" r="1.5"/><circle cx="15" cy="15.5" r="1.5"/>',
		group: 'calculator',
		mock: {
			fields: [
				{ label: 'Paycheck amount', value: '$2,000' },
			],
			result: { label: 'Monthly income', value: '$4,000' },
			rows: [
				['Paychecks a year', '24'],
				['Annual income', '$48,000'],
			],
		},
	},
	{
		name: 'Bill Split Calculator',
		desc: 'Enter both take-home incomes and your shared bills to compare a 50/50 split with a fair split weighted by income.',
		url: '/tools/bill-split-calculator/',
		icon: '<circle cx="7" cy="8" r="3"/><circle cx="17" cy="8" r="3"/><path d="M2 20c0-2.8 2.2-5 5-5s5 2.2 5 5"/><path d="M12 20c0-2.8 2.2-5 5-5s5 2.2 5 5"/>',
		group: 'calculator',
		mock: {
			fields: [
				{ label: 'Your take-home pay', value: '$5,200' },
				{ label: 'Partner’s take-home pay', value: '$3,400' },
				{ label: 'Shared bills', value: '$3,000' },
			],
			result: { label: 'Your fair share (60%)', value: '$1,814' },
			rows: [
				['Partner’s share (40%)', '$1,186'],
			],
		},
	},
	{
		name: 'Bill Split Calculator for Groups',
		desc: 'Enter a total bill, the number of people, and tax and tip to see exactly what each person owes.',
		url: '/tools/group-bill-split-calculator/',
		icon: '<circle cx="8" cy="9" r="2.5"/><circle cx="16" cy="9" r="2.5"/><path d="M3 20c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5"/><path d="M11 20c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5"/><line x1="12" y1="2" x2="12" y2="6"/>',
		group: 'calculator',
		mock: {
			fields: [
				{ label: 'Total bill', value: '$184.00' },
				{ label: 'People', value: '4' },
			],
			chips: { options: ['15%', '18%', '20%', '25%'], selected: 2 },
			result: { label: 'Each person owes', value: '$55.20' },
			rows: [
				['Tip', '$36.80'],
			],
		},
	},
	{
		name: 'Debt-Free Date Calculator',
		desc: 'Enter your debts, interest rates, and monthly payments to see the month you’ll be debt-free and how much interest you’ll pay along the way.',
		url: '/tools/debt-free-date-calculator/',
		icon: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 15l2 2 4-4"/>',
		group: 'calculator',
		mock: {
			fields: [
				{ label: 'Balance', value: '$12,400' },
				{ label: 'Interest rate', value: '19.9%' },
				{ label: 'Monthly payment', value: '$450' },
			],
			result: { label: 'Debt-free by', value: 'Nov 2029' },
			rows: [
				['Interest paid', '$4,300'],
			],
		},
	},
	{
		name: 'Debt Strategy Comparison',
		desc: 'Compare avalanche vs. snowball payoff strategies and see how extra monthly payments affect each one differently.',
		url: '/tools/debt-snowball-vs-avalanche-calculator/',
		icon: '<line x1="6" y1="20" x2="6" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="18" y1="20" x2="18" y2="14"/>',
		group: 'calculator',
		mock: {
			fields: [
				{ label: 'Extra payment each month', value: '$200' },
			],
			bars: [
				{ label: 'Avalanche', value: '$3,180', pct: 83, tone: 'avalanche' },
				{ label: 'Snowball', value: '$3,820', pct: 100, tone: 'snowball' },
			],
			result: { label: 'Avalanche saves', value: '$640' },
		},
	},
	{
		name: 'Emergency Fund Calculator',
		desc: 'Enter your essential monthly expenses and see how much to keep saved for 3, 6, 9, or 12 months of coverage.',
		url: '/tools/emergency-fund-calculator/',
		icon: '<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2"/><circle cx="17" cy="10" r="1"/>',
		group: 'calculator',
		mock: {
			fields: [
				{ label: 'Essential monthly expenses', value: '$3,200' },
			],
			chips: { options: ['3 mo', '6 mo', '9 mo', '12 mo'], selected: 1 },
			result: { label: 'Emergency fund target', value: '$19,200' },
		},
	},
	{
		name: 'Sinking Fund Calculator',
		desc: 'Enter a target amount and target date to calculate exactly how much to save each month to hit your goal on time.',
		url: '/tools/sinking-fund-calculator/',
		icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
		group: 'calculator',
		mock: {
			fields: [
				{ label: 'Target amount', value: '$2,400' },
				{ label: 'Target date', value: 'Dec 2027' },
			],
			result: { label: 'Save each month', value: '$171' },
			rows: [
				['Months to go', '14'],
			],
		},
	},
	{
		name: 'Expense Tracking Readiness',
		desc: 'Answer 6 quick questions to find out if you have tracked enough spending to confidently build your first budget.',
		url: '/tools/expense-tracking-readiness/',
		icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12l2.5 2.5L16 9"/>',
		group: 'assessment',
		mock: {
			question: 'How many months of spending have you tracked?',
			options: ['None yet', 'About a month', 'Three months or more'],
			selected: 2,
		},
	},
	{
		name: 'Sinking Fund Assessment',
		desc: 'Answer 5 quick questions to find out if your expense is a good fit for a sinking fund, an emergency fund, or your regular monthly budget.',
		url: '/tools/sinking-fund-assessment/',
		icon: '<circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/>',
		group: 'assessment',
		mock: {
			question: 'Do you know roughly when this expense will come up?',
			options: ['Yes, on a set date', 'Sometime this year', 'No idea'],
			selected: 0,
		},
	},
	{
		name: 'Find Your Budgeting Style',
		desc: 'Take our 60-second quiz to uncover your unique money personality and get one actionable tip to reach your goals faster.',
		url: '/quiz/budgeting-style/',
		icon: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
		group: 'assessment',
		mock: {
			question: 'What is the first thing you do after getting paid?',
			options: ['Move money into savings and bills right away', 'Check my deposit, then move on', 'Think about what I want to buy'],
			selected: 0,
		},
	},
];
