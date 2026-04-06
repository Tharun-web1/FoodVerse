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
        ifscCode: user?.ifscCode || ''
    });

    // 🎯 Goal Tracking State
    const [dailyGoal, setDailyGoal] = useState(parseInt(localStorage.getItem('daily_earning_goal')) || 1000);
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [tempGoal, setTempGoal] = useState(dailyGoal);

    // Today's Earnings calculation
    const [todayEarnings, setTodayEarnings] = useState(0);

    const [weeklyData, setWeeklyData] = useState([
        { day: 'M', amount: 0, height: '10%' },
        { day: 'T', amount: 0, height: '10%' },
        { day: 'W', amount: 0, height: '10%' },
        { day: 'T', amount: 0, height: '10%' },
        { day: 'F', amount: 0, height: '10%' },
        { day: 'S', amount: 0, height: '10%' },
        { day: 'S', amount: 0, height: '10%' },
    ]);

    useEffect(() => {
        const fetchEarnings = async () => {
            if (!user?.id) return;
            try {
                const res = await api.get(`/delivery-orders/partner/${user.id}`);
                
                // 🛡️ Defensive check & Parse
                let rawData = res.data;
                if (typeof rawData === 'string') {
                    try {
                        rawData = JSON.parse(rawData);
                    } catch (e) {
                        console.error("Failed to parse response as JSON", e);
                    }
                }

                if (!Array.isArray(rawData)) {
                    console.error("Unexpected response format from /delivery-orders/partner/ (Expected array):", rawData);
                    setTransactions([]);
                    setTodayEarnings(0);
                    return;
                }

                const deliveredOrders = rawData.filter(o => o.status === 'DELIVERED');
                
                // Map orders to transaction-like objects
                const txs = deliveredOrders.map(o => ({
                    id: o.id,
                    type: "Delivery",
                    date: new Date(o.deliveredTime).toLocaleDateString(),
                    amount: o.deliveryFee,
                    status: "Completed",
                    rawDate: new Date(o.deliveredTime)
                })).reverse();

                setTransactions(txs);
                
                // Calculate Weekly Stats
                const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                const stats = days.map(day => ({ day, amount: 0, height: '10%' }));
                const now = new Date();
                const startOfWeek = new Date(now);
                const dayOfWeek = now.getDay();
                const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                startOfWeek.setDate(diff);
                startOfWeek.setHours(0, 0, 0, 0);

                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);
                
                const startStr = startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const endStr = endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                setWeekRange(`${startStr} - ${endStr}`);

                let currentWeekSum = 0;
                let todaySum = 0;
                const todayStr = new Date().toLocaleDateString();

                deliveredOrders.forEach(order => {
                    const orderDate = new Date(order.deliveredTime);
                    if (orderDate.toLocaleDateString() === todayStr) {
                        todaySum += order.deliveryFee || 0;
                    }

                    if (orderDate >= startOfWeek && orderDate <= endOfWeek) {
                        let dayIndex = orderDate.getDay() - 1;
                        if (dayIndex === -1) dayIndex = 6; // Sunday
                        if (dayIndex >= 0 && dayIndex < 7) {
                            stats[dayIndex].amount += order.deliveryFee || 0;
                            currentWeekSum += order.deliveryFee || 0;
                        }
                    }
                });

                setTodayEarnings(todaySum);

                // Calculate Last Week's Sum for Percentage Change
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
                if (lastWeekSum > 0) {
                    change = ((currentWeekSum - lastWeekSum) / lastWeekSum) * 100;
                } else if (currentWeekSum > 0) {
                    change = 100;
                }

                setPercentageChange(Math.abs(Math.round(change)));
                setIsPositive(change >= 0);

                const maxAmount = Math.max(...stats.map(s => s.amount), 1);
                setWeeklyData(stats.map(s => ({
                    ...s,
                    height: `${Math.max(10, (s.amount / maxAmount) * 100)}%`
                })));

                // 🔄 Refresh profile to get latest totalEarnings
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
        if (!withdrawAmount || isWithdrawing) return;
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
            fetchWithdrawals(); // Refresh history
        } catch (err) {
            console.error("Withdrawal failed", err);
            showToast("Withdrawal failed. Please try again.", "error");
            setIsWithdrawing(false);
        }
    };

    const [withdrawalHistory, setWithdrawalHistory] = useState([]);

    const fetchWithdrawals = async () => {
        try {
            const res = await api.get('/partner/withdrawals');
            setWithdrawalHistory(res.data);
        } catch (err) {
            console.error("Failed to fetch withdrawals", err);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchWithdrawals();
        }
    }, [user?.id]);

    const handleBankUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateBankDetails(bankData);
            showToast("Bank details updated successfully!", "success");
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
            <div className="container animate-in" style={{ paddingTop: '80px', paddingBottom: '90px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
                    <h4 className="fw-bold mb-0" style={{ letterSpacing: '-0.5px' }}>My Wallet</h4>
                    <button className="btn btn-outline-primary rounded-pill btn-sm px-3 fw-bold" onClick={() => navigate('/delivery/history')} style={{ border: 'none', background: '#eef2ff' }}>
                        <i className="fas fa-history me-1"></i> History
                    </button>
                </div>

                {/* Bank Account Warning/Add Section */}
                {!user?.accountNumber && !showBankForm && (
                    <div className="alert alert-warning border-0 shadow-sm mb-4 d-flex justify-content-between align-items-center p-3 glass-card animate__animated animate__pulse animate__infinite" style={{ background: '#fff9db' }}>
                        <div className="d-flex align-items-center">
                            <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style={{ width: '40px', height: '40px' }}>
                                <i className="fas fa-exclamation-triangle"></i>
                            </div>
                            <div>
                                <h6 className="mb-0 fw-bold">Missing Bank Details</h6>
                                <small className="text-muted">Add your bank account to start withdrawing earnings.</small>
                            </div>
                        </div>
                        <button className="btn btn-warning btn-sm rounded-pill fw-bold" onClick={() => setShowBankForm(true)}>
                            Add Now
                        </button>
                    </div>
                )}

                {/* Bank Account Form */}
                {showBankForm && (
                    <div className="card border-0 shadow-sm rounded-4 mb-4 glass-card animate__animated animate__fadeIn">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center mb-3">
                                <i className="fas fa-university text-primary me-2"></i>
                                <h6 className="fw-bold mb-0">Bank Account Details</h6>
                            </div>
                            <form onSubmit={handleBankUpdate}>
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label small text-muted fw-bold">Bank Name</label>
                                        <input 
                                            type="text" 
                                            className="form-control rounded-3 border-light shadow-sm" 
                                            required
                                            value={bankData.bankName}
                                            onChange={e => setBankData({...bankData, bankName: e.target.value})}
                                            placeholder="e.g., HDFC Bank"
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small text-muted fw-bold">Account Number</label>
                                        <input 
                                            type="text" 
                                            className="form-control rounded-3 border-light shadow-sm" 
                                            required
                                            value={bankData.accountNumber}
                                            onChange={e => setBankData({...bankData, accountNumber: e.target.value})}
                                            placeholder="XXXX XXXX XXXX XXXX"
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small text-muted fw-bold">IFSC Code</label>
                                        <input 
                                            type="text" 
                                            className="form-control rounded-3 border-light shadow-sm" 
                                            required
                                            value={bankData.ifscCode}
                                            onChange={e => setBankData({...bankData, ifscCode: e.target.value})}
                                            placeholder="SBIN0001234"
                                        />
                                    </div>
                                </div>
                                <div className="d-flex gap-2 mt-4">
                                    <button type="submit" className="btn btn-primary rounded-pill flex-grow-1 fw-bold py-3 shadow-primary">Save Bank Details</button>
                                    <button type="button" className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setShowBankForm(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Dual Balance Cards */}
                <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                        <div className="card earnings-card1 h-100 border-0">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <small className="text-white-50 text-uppercase fw-bold ls-1 d-block mb-1">App Wallet</small>
                                    <h2 className="fw-bold mb-0">₹{user?.totalEarnings || 0}</h2>
                                </div>
                                <div className={`badge px-2 py-1 rounded-pill bg-white shadow-sm small ${isPositive ? 'text-success' : 'text-danger'}`}>
                                    <i className={`fas fa-arrow-${isPositive ? 'up' : 'down'} me-1`}></i> {percentageChange}%
                                </div>
                            </div>
                            <div className="mt-3">
                                <button className="btn btn-light rounded-pill px-3 py-1 fw-bold shadow-sm small" style={{ color: '#4f46e5', fontSize: '0.85rem' }} onClick={() => setShowWithdrawModal(true)}>
                                    <i className="fas fa-wallet me-1"></i> Withdraw
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="card bank-balance-card h-100 border-0">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <small className="text-white-50 text-uppercase fw-bold ls-1 d-block mb-1">Bank Account</small>
                                    <h2 className="fw-bold mb-0">₹{user?.bankBalance || 0}</h2>
                                </div>
                                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '32px', height: '32px', color: '#10b981' }}>
                                    <i className="fas fa-university small"></i>
                                </div>
                            </div>
                            <div className="mt-3">
                                <span className="badge bg-white-10 text-white-50 rounded-pill px-3 py-1 small" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                    <i className="fas fa-shield-alt me-1"></i> Secured & Transferred
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🎯 Daily Goal Progress Card */}
                <div className="card glass-card border-0 shadow-sm mb-4 goal-card-premium overflow-hidden">
                    <div className="card-body p-4 position-relative">
                        <div className="row align-items-center">
                            <div className="col-7">
                                <div className="d-flex align-items-center mb-1">
                                    <h6 className="fw-bold mb-0 me-2">Today's Goal</h6>
                                    <button className="btn btn-link btn-sm p-0 text-primary" onClick={() => { setTempGoal(dailyGoal); setIsEditingGoal(true); }}>
                                        <i className="fas fa-edit small"></i>
                                    </button>
                                </div>
                                <h3 className="fw-bold mb-1">₹{todayEarnings} <small className="text-muted fs-6">/ ₹{dailyGoal}</small></h3>
                                <div className="progress mt-3 rounded-pill" style={{ height: '8px', background: 'rgba(79, 70, 229, 0.1)' }}>
                                    <div 
                                        className="progress-bar rounded-pill bg-primary" 
                                        style={{ width: `${goalProgress}%`, transition: 'width 1s ease' }}
                                    ></div>
                                </div>
                                <p className="small text-muted mt-2 mb-0">
                                    {goalProgress >= 100 ? '🎉 Goal Reached!' : `${100 - goalProgress}% more to reach your daily target.`}
                                </p>
                            </div>
                            <div className="col-5 text-center px-0">
                                <div className="goal-circle mx-auto">
                                    <svg viewBox="0 0 36 36" className="circular-chart primary">
                                        <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <path className="circle" strokeDasharray={`${goalProgress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <text x="18" y="20.35" className="percentage">{goalProgress}%</text>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {isEditingGoal && (
                            <div className="goal-edit-overlay animate__animated animate__fadeIn">
                                <form onSubmit={handleGoalUpdate} className="text-center">
                                    <h6 className="fw-bold mb-3">Set Daily Earning Goal</h6>
                                    <div className="input-group mb-3 px-4">
                                        <span className="input-group-text bg-white border-0">₹</span>
                                        <input 
                                            type="number" 
                                            className="form-control border-0 text-center fw-bold" 
                                            value={tempGoal} 
                                            onChange={(e) => setTempGoal(e.target.value)} 
                                            autoFocus
                                        />
                                    </div>
                                    <div className="d-flex gap-2 justify-content-center">
                                        <button type="submit" className="btn btn-primary rounded-pill btn-sm px-4">Save</button>
                                        <button type="button" className="btn btn-light rounded-pill btn-sm px-4" onClick={() => setIsEditingGoal(false)}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                {/* Smooth Area Chart */}
                <div className="card glass-card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h6 className="fw-bold mb-1">Weekly Trends</h6>
                                <small className="text-muted">{weekRange}</small>
                            </div>
                            <div className="bg-light p-2 rounded-3 text-primary">
                                <i className="fas fa-chart-area"></i>
                            </div>
                        </div>
                        <div style={{ width: '100%', height: 200 }}>
                            <ResponsiveContainer>
                                <AreaChart data={weeklyData}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="day" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#94a3b8', fontSize: 12}} 
                                    />
                                    <YAxis hide domain={[0, 'auto']} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="amount" 
                                        stroke="#4f46e5" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorAmount)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="d-flex justify-content-between align-items-center mb-3 px-1">
                    <h6 className="fw-bold mb-0 text-muted text-uppercase small ls-1">Recent Activity</h6>
                    <small className="text-primary fw-bold" style={{ cursor: 'pointer' }} onClick={() => navigate('/delivery/history')}>View All</small>
                </div>
                
                <div className="activity-feed">
                    {[
                        ...transactions,
                        ...withdrawalHistory.map(w => ({
                            id: `w-${w.id}`,
                            type: "Withdrawal",
                            date: new Date(w.requestTime).toLocaleDateString(),
                            amount: -w.amount,
                            status: w.status,
                            rawDate: new Date(w.requestTime)
                        }))
                    ].sort((a, b) => (b.rawDate || new Date(b.date)) - (a.rawDate || new Date(a.date)))
                    .length > 0 ? [
                        ...transactions,
                        ...withdrawalHistory.map(w => ({
                            id: `w-${w.id}`,
                            type: "Withdrawal",
                            date: new Date(w.requestTime).toLocaleDateString(),
                            amount: -w.amount,
                            status: w.status,
                            rawDate: new Date(w.requestTime)
                        }))
                    ].sort((a, b) => (b.rawDate || new Date(b.date)) - (a.rawDate || new Date(a.date)))
                    .slice(0, 5) // Show only latest 5 in dashboard
                    .map(tx => (
                        <div key={tx.id} className="activity-item d-flex justify-content-between align-items-center shadow-sm">
                            <div className="d-flex align-items-center">
                                <div className="transaction-icon me-3 shadow-sm bg-white" style={{ position: 'relative' }}>
                                    <i className={`fas ${tx.amount > 0 ? 'fa-bicycle text-success' : 'fa-university text-primary'}`}></i>
                                    {tx.amount > 0 && <span className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle" style={{ width: '12px', height: '12px' }}></span>}
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <h6 className="mb-0 fw-bold text-truncate">{tx.type}</h6>
                                    <small className="text-muted d-block">{tx.date} • <span className={`fw-bold ${tx.status === 'Completed' || tx.status === 'DELIVERED' ? 'text-success' : 'text-warning'}`}>{tx.status}</span></small>
                                </div>
                            </div>
                            <span className={`fw-bold h6 mb-0 ${tx.amount > 0 ? 'text-success' : 'text-dark'}`}>
                                {tx.amount > 0 ? '+' : '-'}₹{Math.abs(tx.amount)}
                            </span>
                        </div>
                    )) : (
                        <div className="text-center bg-white rounded-4 p-5 shadow-sm">
                            <div className="mb-3 text-muted opacity-25">
                                <i className="fas fa-wallet fa-4x"></i>
                            </div>
                            <p className="text-muted mb-0">No recent transactions to show.</p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Withdrawal Bottom Sheet */}
            <div className={`bottom-sheet-backdrop ${showWithdrawModal ? 'show' : ''}`} onClick={() => setShowWithdrawModal(false)}></div>
            <div className={`bottom-sheet ${showWithdrawModal ? 'show' : ''}`}>
                <div className="sheet-handle"></div>
                <div className="p-4">
                    <h5 className="fw-bold mb-4 text-center">Withdraw Money</h5>
                    
                    <div className="withdraw-input-container mb-4">
                        <small className="text-muted d-block text-center mb-1 fw-bold text-uppercase small" style={{ letterSpacing: '1px' }}>Amount to Withdraw</small>
                        <div className="d-flex align-items-center justify-content-center">
                            <span className="h1 fw-bold mb-0 text-primary me-1">₹</span>
                            <input 
                                type="number" 
                                className="withdraw-input" 
                                placeholder="0" 
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="d-flex gap-2 mb-4">
                        <div className="amount-chip shadow-sm" onClick={() => setWithdrawAmount('500')}>₹500</div>
                        <div className="amount-chip shadow-sm" onClick={() => setWithdrawAmount('1000')}>₹1000</div>
                        <div className="amount-chip shadow-sm" onClick={() => setWithdrawAmount(user?.totalEarnings || '0')}>Max</div>
                    </div>

                    <div className="bank-card mb-4 shadow-sm glass-card">
                        <div className="bank-icon">
                            <i className="fas fa-university"></i>
                        </div>
                        <div className="flex-grow-1">
                            <h6 className="mb-0 fw-bold">{user?.bankName || 'No Bank Linked'}</h6>
                            <small className="text-muted">
                                {user?.accountNumber ? `Linked: XXXX XXXX ${user.accountNumber.slice(-4)}` : 'Please add bank details'}
                            </small>
                        </div>
                        <button className="btn btn-link btn-sm text-primary fw-bold text-decoration-none" onClick={() => { setShowWithdrawModal(false); setShowBankForm(true); }}>
                            Edit
                        </button>
                    </div>

                    <button 
                        className="withdraw-btn-main mb-3 py-3"
                        disabled={!withdrawAmount || isWithdrawing}
                        onClick={handleWithdraw}
                    >
                        {isWithdrawing ? (
                            <span><i className="fas fa-circle-notch fa-spin me-2"></i> Processing Withdrawal...</span>
                        ) : (
                            <span><i className="fas fa-check-circle me-2"></i> Confirm Withdrawal</span>
                        )}
                    </button>
                    
                    <button className="btn btn-link text-muted w-100 text-decoration-none fw-bold small text-uppercase" style={{ letterSpacing: '1px' }} onClick={() => setShowWithdrawModal(false)}>
                        Go Back
                    </button>
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default Earnings;
