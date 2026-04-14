import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';
import './Earnings.css';

const BANK_LIST = [
    "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank",
    "Punjab National Bank", "Bank of Baroda", "Canara Bank", "Union Bank of India",
    "IndusInd Bank", "Bank of India", "Indian Bank", "Central Bank of India",
    "IDFC FIRST Bank", "Federal Bank", "Yes Bank", "RBL Bank", "South Indian Bank"
];

const Earnings = () => {
    const { user, refreshProfile, updateBankDetails } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [weekRange, setWeekRange] = useState('');
    const [percentageChange, setPercentageChange] = useState(0);
    const [isPositive, setIsPositive] = useState(true);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [showBankForm, setShowBankForm] = useState(false);
    const [bankData, setBankData] = useState({
        bankName: user?.bankName || '',
        accountNumber: user?.accountNumber || '',
        ifscCode: user?.ifscCode || '',
        accountHolderName: user?.accountHolderName || ''
    });

    const [filteredBanks, setFilteredBanks] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleBankNameChange = (e) => {
        const value = e.target.value;
        setBankData({ ...bankData, bankName: value });
        
        if (value.length > 0) {
            const filtered = BANK_LIST.filter(bank => 
                bank.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredBanks(filtered);
            setShowSuggestions(true);
        } else {
            setFilteredBanks([]);
            setShowSuggestions(false);
        }
    };

    const selectBank = (bankName) => {
        setBankData({ ...bankData, bankName });
        setShowSuggestions(false);
    };

    // 🎯 Goal Tracking State
    const [dailyGoal, setDailyGoal] = useState(parseInt(localStorage.getItem('daily_earning_goal')) || 1000);
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [tempGoal, setTempGoal] = useState(dailyGoal);

    // Stats State
    const [todayEarnings, setTodayEarnings] = useState(0);
    const [totalDelivered, setTotalDelivered] = useState(0);
    const [monthlyIncome, setMonthlyIncome] = useState(0);
    const [avgEarning, setAvgEarning] = useState(0);

    const [weeklyData, setWeeklyData] = useState([
        { day: 'M', amount: 0 },
        { day: 'T', amount: 0 },
        { day: 'W', amount: 0 },
        { day: 'T', amount: 0 },
        { day: 'F', amount: 0 },
        { day: 'S', amount: 0 },
        { day: 'S', amount: 0 },
    ]);

    useEffect(() => {
        const fetchEarnings = async () => {
            if (!user?.id) return;
            try {
                const res = await api.get(`/delivery-orders/partner/${user.id}`);
                
                let rawData = res.data;
                if (typeof rawData === 'string') {
                    try { rawData = JSON.parse(rawData); } catch (e) {}
                }

                if (!Array.isArray(rawData)) {
                    setTransactions([]);
                    return;
                }

                const deliveredOrders = rawData.filter(o => o.status === 'DELIVERED');
                setTotalDelivered(deliveredOrders.length);
                
                // Transactions list
                const txs = deliveredOrders.map(o => ({
                    id: o.id,
                    type: "Delivery Completed",
                    date: new Date(o.deliveredTime).toLocaleDateString(),
                    amount: o.deliveryFee,
                    status: "Completed",
                    rawDate: new Date(o.deliveredTime)
                })).reverse();

                setTransactions(txs);
                
                // Weekly stats setup
                const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                const stats = days.map(day => ({ day, amount: 0 }));
                const now = new Date();
                const startOfWeek = new Date(now);
                const dayOfWeek = now.getDay();
                const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                startOfWeek.setDate(diff);
                startOfWeek.setHours(0, 0, 0, 0);

                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                
                setWeekRange(`${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);

                let currentWeekSum = 0;
                let todaySum = 0;
                let currentMonthSum = 0;
                const todayStr = new Date().toLocaleDateString();
                const currentMonth = now.getMonth();

                deliveredOrders.forEach(order => {
                    const orderDate = new Date(order.deliveredTime);
                    const fee = order.deliveryFee || 0;

                    if (orderDate.toLocaleDateString() === todayStr) {
                        todaySum += fee;
                    }
                    if (orderDate.getMonth() === currentMonth) {
                        currentMonthSum += fee;
                    }

                    if (orderDate >= startOfWeek && orderDate <= endOfWeek) {
                        let dayIndex = orderDate.getDay() - 1;
                        if (dayIndex === -1) dayIndex = 6;
                        if (dayIndex >= 0 && dayIndex < 7) {
                            stats[dayIndex].amount += fee;
                            currentWeekSum += fee;
                        }
                    }
                });

                setTodayEarnings(todaySum);
                setMonthlyIncome(currentMonthSum);
                setAvgEarning(deliveredOrders.length > 0 ? Math.round(currentMonthSum / (deliveredOrders.filter(o => new Date(o.deliveredTime).getMonth() === currentMonth).length || 1)) : 0);
                setWeeklyData(stats);

                // Percentage change
                const lastWeekStart = new Date(startOfWeek);
                lastWeekStart.setDate(lastWeekStart.getDate() - 7);
                const lastWeekEnd = new Date(startOfWeek);

                let lastWeekSum = 0;
                deliveredOrders.forEach(order => {
                    const orderDate = new Date(order.deliveredTime);
                    if (orderDate >= lastWeekStart && orderDate < lastWeekEnd) {
                        lastWeekSum += order.deliveryFee || 0;
                    }
                });

                let change = 0;
                if (lastWeekSum > 0) change = ((currentWeekSum - lastWeekSum) / lastWeekSum) * 100;
                else if (currentWeekSum > 0) change = 100;

                setPercentageChange(Math.abs(Math.round(change)));
                setIsPositive(change >= 0);

                await refreshProfile();
            } catch (err) {
                console.error("Failed to fetch earnings", err);
            }
        };

        fetchEarnings();
    }, [user?.id]);

    const handleWithdraw = async () => {
        if (!user?.accountNumber) {
            showToast("Please add bank details first", "warning");
            setShowBankForm(true);
            return;
        }
        const amount = parseFloat(withdrawAmount);
        if (amount <= 0 || amount > (user?.totalEarnings || 0)) {
            showToast("Invalid amount", "error");
            return;
        }

        setIsWithdrawing(true);
        try {
            await api.post(`/partner/withdraw?amount=${amount}`);
            setIsWithdrawing(false);
            setShowWithdrawModal(false);
            setWithdrawAmount('');
            showToast("Withdrawal request submitted successfully!", "success");
            await refreshProfile();
            fetchWithdrawals();
        } catch (err) {
            showToast("Withdrawal failed", "error");
            setIsWithdrawing(false);
        }
    };

    const [withdrawalHistory, setWithdrawalHistory] = useState([]);

    const fetchWithdrawals = async () => {
        try {
            const res = await api.get('/partner/withdrawals');
            setWithdrawalHistory(res.data);
        } catch (err) {}
    };

    useEffect(() => {
        if (user?.id) fetchWithdrawals();
    }, [user?.id]);

    const handleBankUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateBankDetails(bankData);
            showToast("Bank details updated!", "success");
            setShowBankForm(false);
        } catch (err) {
            showToast("Failed to update bank details", "error");
        }
    };

    const handleGoalUpdate = (e) => {
        e.preventDefault();
        const goal = parseInt(tempGoal);
        if (goal > 0) {
            setDailyGoal(goal);
            localStorage.setItem('daily_earning_goal', goal);
            setIsEditingGoal(false);
            showToast("Daily goal updated!", "success");
        }
    };

    const goalProgress = Math.min(100, Math.round((todayEarnings / dailyGoal) * 100));

    return (
        <div className="bg-light min-vh-100 pb-5 delivery-body">
            <Navbar />
            
            <div className="container earnings-header-section">
                <div className="animate-in">
                    <div className="lifetime-earnings-chip">
                        <i className="fas fa-award"></i>
                        <span>Lifetime: ₹{user?.lifetimeEarnings || totalDelivered * 45}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="fw-bold mb-0">Earnings Dashboard</h2>
                        <div className="bg-white rounded-4 p-2 shadow-sm d-flex gap-2">
                             <button className="btn btn-light btn-sm rounded-pill px-3 fw-bold" onClick={() => setShowBankForm(true)}>
                                <i className="fas fa-university me-1"></i> Bank
                            </button>
                             <button className="btn btn-light btn-sm rounded-pill px-3 fw-bold" onClick={() => navigate('/delivery/history')}>
                                <i className="fas fa-list me-1"></i> Trips
                            </button>
                        </div>
                    </div>
                </div>

                <div className="wallet-cards-grid animate-in" style={{ animationDelay: '0.1s' }}>
                    <div className="premium-wallet-card" style={{ gridColumn: 'span 2' }}>
                        <div className="d-flex justify-content-between align-items-start position-relative z-1">
                            <div>
                                <p className="text-white-50 small fw-bold text-uppercase mb-1" style={{ letterSpacing: '1px' }}>Current Balance</p>
                                <h1 className="fw-bold mb-0">₹{user?.totalEarnings || 0}</h1>
                                <div className="mt-4 d-flex gap-3">
                                    <button className="btn btn-light rounded-pill px-4 fw-bold shadow-sm" onClick={() => setShowWithdrawModal(true)}>
                                        <i className="fas fa-paper-plane me-2"></i> Withdraw
                                    </button>
                                    {!user?.accountNumber && (
                                        <button className="btn btn-outline-light rounded-pill px-4 fw-bold" onClick={() => setShowBankForm(true)} style={{ border: '2px solid rgba(255,255,255,0.3)' }}>
                                            <i className="fas fa-plus me-2"></i> Add Bank
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className={`badge rounded-pill bg-white shadow-sm py-2 px-3 fw-bold ${isPositive ? 'text-success' : 'text-danger'}`} style={{ fontSize: '0.8rem' }}>
                                <i className={`fas fa-arrow-${isPositive ? 'up' : 'down'} me-1`}></i> {percentageChange}%
                            </div>
                        </div>
                        <svg className="card-pattern" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <circle cx="100" cy="0" r="80" fill="white" />
                        </svg>
                    </div>
                </div>

                {/* 📊 Detailed Stats Grid */}
                <div className="stats-breakdown-grid animate-in" style={{ animationDelay: '0.2s' }}>
                    <div className="stat-mini-item">
                        <div className="stat-icon-bg"><i className="fas fa-bicycle"></i></div>
                        <h5 className="fw-bold mb-0">{totalDelivered}</h5>
                        <p className="text-muted small mb-0">Total Trips</p>
                    </div>
                    <div className="stat-mini-item">
                        <div className="stat-icon-bg" style={{background: '#d1fae5', color: '#059669'}}><i className="fas fa-calendar-alt"></i></div>
                        <h5 className="fw-bold mb-0">₹{monthlyIncome}</h5>
                        <p className="text-muted small mb-0">This Month</p>
                    </div>
                    <div className="stat-mini-item">
                        <div className="stat-icon-bg" style={{background: '#fef3c7', color: '#d97706'}}><i className="fas fa-chart-line"></i></div>
                        <h5 className="fw-bold mb-0">₹{avgEarning}</h5>
                        <p className="text-muted small mb-0">Avg / Trip</p>
                    </div>
                    <div className="stat-mini-item">
                        <div className="stat-icon-bg" style={{background: '#eef2ff', color: '#4f46e5'}}><i className="fas fa-clock"></i></div>
                        <h5 className="fw-bold mb-0">4.8</h5>
                        <p className="text-muted small mb-0">Rating</p>
                    </div>
                </div>

                {/* 🎯 Quest Goal Section */}
                <div className="quest-goal-card animate-in" style={{ animationDelay: '0.3s' }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h5 className="fw-bold mb-1">Today's Quest</h5>
                            <p className="text-muted small mb-0">Reach ₹{dailyGoal} to earn a daily badge!</p>
                        </div>
                        <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => { setTempGoal(dailyGoal); setIsEditingGoal(true); }}>
                            Set Goal
                        </button>
                    </div>

                    <div className="quest-milestone">
                        <span className="fw-bold">₹{todayEarnings} Earned</span>
                        <span className="text-muted fw-bold">Target: ₹{dailyGoal}</span>
                    </div>

                    <div className="quest-progress-track">
                        <div className="quest-progress-fill" style={{ width: `${goalProgress}%` }}></div>
                        <div className="milestone-marker" style={{ left: '25%' }}></div>
                        <div className="milestone-marker" style={{ left: '50%' }}></div>
                        <div className="milestone-marker" style={{ left: '75%' }}></div>
                    </div>

                    {goalProgress === 100 && (
                        <div className="mt-3 text-center text-success fw-bold animate__animated animate__heartBeat">
                            🎉 Quest Complete! You're a pro!
                        </div>
                    )}

                    {isEditingGoal && (
                        <div className="goal-edit-overlay animate__animated animate__fadeIn">
                            <form onSubmit={handleGoalUpdate} className="text-center">
                                <h6 className="fw-bold mb-4">Update Daily Goal</h6>
                                <div className="input-group mb-4 px-5">
                                    <span className="input-group-text bg-transparent border-0 fs-3 fw-bold">₹</span>
                                    <input 
                                        type="number" 
                                        className="form-control border-0 text-center fs-2 fw-bold" 
                                        value={tempGoal} 
                                        onChange={(e) => setTempGoal(e.target.value)} 
                                        autoFocus
                                    />
                                </div>
                                <div className="d-flex gap-3 justify-content-center">
                                    <button type="submit" className="btn btn-primary rounded-pill px-5">Save Goal</button>
                                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setIsEditingGoal(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* 📈 Glass Chart Container */}
                <div className="glass-chart-container animate-in" style={{ animationDelay: '0.4s' }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h6 className="fw-bold mb-0">Earning Trends</h6>
                        <span className="badge bg-light text-muted rounded-pill px-3">{weekRange}</span>
                    </div>
                    <div style={{ width: '100%', height: 220 }}>
                        <ResponsiveContainer>
                            <AreaChart data={weeklyData}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <YAxis hide domain={[0, 'auto']} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 🌊 Recent Activity */}
                <div className="activity-heading animate-in" style={{ animationDelay: '0.5s' }}>
                    <h6 className="fw-bold mb-0 text-muted">RECENT ACTIVITY</h6>
                    <button className="btn btn-link btn-sm text-primary fw-bold text-decoration-none" onClick={() => navigate('/delivery/history')}>See All</button>
                </div>

                <div className="activity-feed animate-in" style={{ animationDelay: '0.5s' }}>
                    {[
                        ...transactions,
                        ...withdrawalHistory.map(w => ({
                            id: `w-${w.id}`,
                            type: "Funds Withdrawal",
                            date: new Date(w.requestTime).toLocaleDateString(),
                            amount: -w.amount,
                            status: w.status,
                            rawDate: new Date(w.requestTime)
                        }))
                    ].sort((a, b) => b.rawDate - a.rawDate).slice(0, 5).map(tx => (
                        <div key={tx.id} className="premium-activity-item">
                            <div className="d-flex align-items-center">
                                <div className="stat-icon-bg m-0 me-3" style={{width: '40px', height: '40px', background: tx.amount > 0 ? '#d1fae5' : '#fee2e2', color: tx.amount > 0 ? '#059669' : '#b91c1c'}}>
                                    <i className={`fas ${tx.amount > 0 ? 'fa-plus-circle' : 'fa-arrow-down'}`}></i>
                                </div>
                                <div>
                                    <h6 className="mb-0 fw-bold">{tx.type}</h6>
                                    <small className="text-muted">{tx.date}</small>
                                </div>
                            </div>
                            <div className="text-end">
                                <h6 className={`fw-bold mb-0 ${tx.amount > 0 ? 'text-success' : 'text-danger'}`}>
                                    {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                                </h6>
                                <span className={`tx-status-badge ${tx.status === 'Completed' || tx.status === 'DELIVERED' ? 'status-completed' : 'status-pending'}`}>
                                    {tx.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 🏦 Bank Details Form Overlay */}
            {showBankForm && (
                <div className="fixed-overlay animate__animated animate__fadeIn">
                    <div className="card glass-card border-0 shadow-lg p-4 w-100 mx-3" style={{ maxWidth: '450px' }}>
                        <div className="text-center mb-4">
                            <div className="stat-icon-bg mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                                <i className="fas fa-university fs-3"></i>
                            </div>
                            <h4 className="fw-bold mb-1">Bank Details</h4>
                            <p className="text-muted small">Enter your account information for withdrawals</p>
                        </div>
                        
                        <form onSubmit={handleBankUpdate}>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">ACCOUNT HOLDER NAME</label>
                                <input 
                                    type="text" 
                                    className="form-control rounded-4 border-light p-3" 
                                    placeholder="Name as per bank records"
                                    required
                                    value={bankData.accountHolderName}
                                    onChange={e => setBankData({...bankData, accountHolderName: e.target.value})}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">BANK NAME</label>
                                <input 
                                    type="text" 
                                    className="form-control rounded-4 border-light p-3" 
                                    placeholder="e.g. HDFC Bank"
                                    required
                                    value={bankData.bankName}
                                    onChange={handleBankNameChange}
                                    autoComplete="off"
                                />
                                {showSuggestions && filteredBanks.length > 0 && (
                                    <div className="bank-suggestions shadow-sm">
                                        {filteredBanks.map((bank, index) => (
                                            <div 
                                                key={index} 
                                                className="suggestion-item"
                                                onClick={() => selectBank(bank)}
                                            >
                                                <i className="fas fa-university text-primary opacity-50"></i>
                                                {bank}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">ACCOUNT NUMBER</label>
                                <input 
                                    type="text" 
                                    className="form-control rounded-4 border-light p-3" 
                                    placeholder="XXXX XXXX XXXX XXXX"
                                    required
                                    value={bankData.accountNumber}
                                    onChange={e => setBankData({...bankData, accountNumber: e.target.value})}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="form-label small fw-bold text-muted">IFSC CODE</label>
                                <input 
                                    type="text" 
                                    className="form-control rounded-4 border-light p-3" 
                                    placeholder="IFSC0001234"
                                    required
                                    value={bankData.ifscCode}
                                    onChange={e => setBankData({...bankData, ifscCode: e.target.value})}
                                />
                            </div>
                            
                            <div className="d-flex gap-3">
                                <button type="submit" className="btn btn-primary rounded-pill flex-grow-1 py-3 fw-bold">
                                    Save Details
                                </button>
                                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowBankForm(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 💸 Instant Withdrawal Card Modal */}
            {showWithdrawModal && (
                <div className="fixed-overlay animate__animated animate__fadeIn">
                    <div className="card glass-card border-0 shadow-lg p-4 w-100 mx-3" style={{ maxWidth: '450px' }}>
                        <div className="text-center mb-4">
                            <div className="stat-icon-bg mx-auto mb-3" style={{ width: '60px', height: '60px', background: '#eef2ff', color: '#4f46e5' }}>
                                <i className="fas fa-paper-plane fs-3"></i>
                            </div>
                            <h4 className="fw-bold mb-1">Instant Withdrawal</h4>
                            <p className="text-muted small">Transfer funds to your linked bank account</p>
                        </div>
                        
                        <div className="withdraw-amount-display mb-4">
                            <span className="currency-symbol">₹</span>
                            <input 
                                type="number" 
                                className="large-amount-input" 
                                placeholder="0" 
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="d-flex gap-2 mb-4 justify-content-center">
                            <div className="amount-chip" onClick={() => setWithdrawAmount('100')}>₹100</div>
                            <div className="amount-chip" onClick={() => setWithdrawAmount('500')}>₹500</div>
                            <div className="amount-chip pulse-active" style={{border: '1px solid var(--primary)', color: 'var(--primary)'}} onClick={() => setWithdrawAmount(user?.totalEarnings || '0')}>MAX</div>
                        </div>

                        <div className="p-3 rounded-4 bg-light border mb-4 d-flex align-items-center">
                            <div className="stat-icon-bg ms-0 me-3" style={{width: '40px', height: '40px'}}><i className="fas fa-university"></i></div>
                            <div className="flex-grow-1">
                                <h6 className="mb-0 fw-bold">{user?.bankName || 'HDFC Bank'}</h6>
                                <small className="text-muted d-block">{user?.accountNumber ? `•••• •••• ${user.accountNumber.slice(-4)}` : 'Bank detail missing'}</small>
                                <small className="text-primary fw-bold" style={{ fontSize: '0.7rem' }}>A/C: {user?.accountHolderName || 'Not Set'}</small>
                            </div>
                        </div>

                        <div className="d-flex gap-3">
                            <button className="withdraw-btn-main py-3 flex-grow-1" onClick={handleWithdraw} disabled={!withdrawAmount || isWithdrawing}>
                                {isWithdrawing ? 'Processing...' : 'Confirm'}
                            </button>
                            <button className="btn btn-light rounded-pill px-4" onClick={() => setShowWithdrawModal(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
};

export default Earnings;
