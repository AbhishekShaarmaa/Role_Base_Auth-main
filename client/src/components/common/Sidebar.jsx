import { BarChart2, DollarSign, Menu, Settings, ShoppingBag, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const SIDEBAR_ITEMS = [
	{
		name: "Report",
		icon: BarChart2,
		color: "#6366f1",
		href: "/report",
	},
	{
		name: "Pending",
		icon: Users,
		color: "#8B5CF6",
		href: "/pending"
	},
	{
		name: "Rejected",
		icon: ShoppingBag,
		color: "#EC4899",
		href: "/rejected"
	},
	{
		name: "Expenses",
		icon: ShoppingCart,
		color: "#10B981",
		href: "/expense"
	},
	{
		name: "Incomes",
		icon: DollarSign,
		color: "#F59E0B",
		href: "/income"
	},
	{
		name: "Transactions",
		icon: TrendingUp,
		color: "#3B82F6",
		href: "/transactions"
	},
	{
		name: "Settings",
		icon: Settings,
		color: "#6EE7B7",
		href: "/settings"
	},
];

const Sidebar = () => {
	const [navItems, setNavItems] = useState(SIDEBAR_ITEMS);
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const userDetails = useSelector((state) => state.AuthSlice?.user);

	useEffect(() => {
		const filteredNavs = SIDEBAR_ITEMS.filter((nav) => {
			if (nav.name === "Expenses" || nav.name === "Incomes") {
				return userDetails?.role === "accountant" || userDetails?.role === "admin";
			}
			return true;
		});

		setNavItems(filteredNavs);
	}, [userDetails]);

	return (
		<motion.div
			className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${isSidebarOpen ? "w-64" : "w-20"
				}`}
			animate={{ width: isSidebarOpen ? 256 : 80 }}
		>
			<div className='h-full bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700'>
				<motion.button
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
					onClick={() => setIsSidebarOpen(!isSidebarOpen)}
					className='p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit'
				>
					<Menu size={24} />
				</motion.button>

				<nav className='mt-8 flex-grow'>
					{navItems.map((item) => (
						<Link key={item.href} to={item.href}>
							<motion.div className='flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2'>
								<item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
								<AnimatePresence>
									{isSidebarOpen && (
										<motion.span
											className='ml-4 whitespace-nowrap'
											initial={{ opacity: 0, width: 0 }}
											animate={{ opacity: 1, width: "auto" }}
											exit={{ opacity: 0, width: 0 }}
											transition={{ duration: 0.2, delay: 0.3 }}
										>
											{item.name}
										</motion.span>
									)}
								</AnimatePresence>
							</motion.div>
						</Link>
					))}
				</nav>
			</div>
		</motion.div>
	);
};

export default Sidebar;