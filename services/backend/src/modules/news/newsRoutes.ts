import { Router, Request, Response } from 'express';
import { authenticateToken, requireRoles } from '../../middleware/auth';

export interface NewsItem {
  id: number;
  type: 'ALL' | 'DL' | 'PLAYER' | 'URGENT';
  text: string;
  category: string;
  status: boolean;
  date: string;
  author?: string;
}

let broadcastNews: NewsItem[] = [
  {
    id: 1,
    type: 'ALL',
    category: 'GENERAL',
    text: 'WELCOME TO NEXUSVIP LIVE EXCHANGE. ENJOY SUB-SECOND IN-PLAY BETTING, 3-DEPTH BETFAIR LIQUIDITY & 5-SECOND AUTOMATED UPI WITHDRAWALS.',
    status: true,
    date: new Date().toISOString()
  },
  {
    id: 2,
    type: 'ALL',
    category: 'CRICKET',
    text: 'LIVE CRICKET TOSS & BOOKMAKER MARKETS ARE LIVE ACROSS ALL INTERNATIONAL TOURNAMENTS. BACK & LAY WITH ZERO SLIPPAGE.',
    status: true,
    date: new Date().toISOString()
  },
  {
    id: 3,
    type: 'ALL',
    category: 'CASINO',
    text: 'LIVE INDIAN CASINO: TEEN PATTI 20-20, DRAGON TIGER 6, LUCKY 7 (7 UP 7 DOWN), AND AMAR AKBAR ANTHONY ARE NOW ACTIVE WITH LIVE DEALER STREAMS.',
    status: true,
    date: new Date().toISOString()
  },
  {
    id: 4,
    type: 'DL',
    category: 'POLICY',
    text: 'DEALER NOTICE: ALL SETTLEMENTS ARE RUNNING AT ZERO COMMISSION OVERHANG. UTR VERIFICATION MANDATORY FOR INSTANT APPROVALS.',
    status: true,
    date: new Date().toISOString()
  }
];

export const newsRouter = Router();

// GET /api/news (Public announcement feed, optional type filter e.g. ALL, DL, PLAYER)
newsRouter.get('/', (req: Request, res: Response) => {
  const type = (req.query.type as string)?.toUpperCase();
  let items = broadcastNews.filter((n) => n.status);

  if (type && type !== 'ALL') {
    items = items.filter((n) => n.type === 'ALL' || n.type === type);
  }

  res.json({
    success: true,
    news: items
  });
});

// POST /api/news (Admin/Dealer broadcast new flash alert)
newsRouter.post('/', authenticateToken, requireRoles(['ADMIN', 'SUPER_MASTER']), (req: Request, res: Response) => {
  const { text, type = 'ALL', category = 'GENERAL' } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length < 5) {
    return res.status(400).json({ error: 'News text must be at least 5 characters.' });
  }

  const newItem: NewsItem = {
    id: Date.now(),
    type: type as any,
    category,
    text: text.trim(),
    status: true,
    date: new Date().toISOString(),
    author: (req as any).user?.username || 'Admin'
  };

  broadcastNews.unshift(newItem);

  // Keep latest 20 items
  if (broadcastNews.length > 20) {
    broadcastNews = broadcastNews.slice(0, 20);
  }

  return res.status(201).json({
    success: true,
    message: 'Announcement broadcasted successfully',
    newsItem: newItem
  });
});
