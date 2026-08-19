import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        # Top banner accent line
        self.setFillColor(colors.HexColor('#f36c21'))
        self.rect(32, letter[1] - 18, letter[0] - 64, 2.5, fill=True, stroke=False)

        # Footer text & page numbering
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(colors.HexColor('#64748b'))
        self.drawString(32, 18, "NEXUSVIP EXCHANGE — CONFIDENTIAL STRATEGIC DOMAIN PORTFOLIO")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 32, 18, page_str)

        # Footer divider line
        self.setStrokeColor(colors.HexColor('#e2e8f0'))
        self.setLineWidth(0.5)
        self.line(32, 28, letter[0] - 32, 28)
        self.restoreState()

def build_domain_pdf(output_filename):
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=letter,
        leftMargin=32,
        rightMargin=32,
        topMargin=26,
        bottomMargin=32
    )

    styles = getSampleStyleSheet()

    # Custom typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=21,
        textColor=colors.HexColor('#111111'),
        alignment=0
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=colors.HexColor('#f36c21'),
        spaceAfter=3
    )

    body_style = ParagraphStyle(
        'DocBody',
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor('#475569'),
        spaceAfter=3
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#1e293b')
    )

    cat_header_style = ParagraphStyle(
        'CategoryHeader',
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=5,
        spaceAfter=2
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white,
        alignment=0
    )

    domain_name_style = ParagraphStyle(
        'DomainName',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=10.5,
        textColor=colors.HexColor('#ea580c')
    )

    cell_style = ParagraphStyle(
        'TableCell',
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#334155')
    )

    badge_style = ParagraphStyle(
        'TableBadge',
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#0d9488')
    )

    story = []

    # 1. Header Banner Block
    story.append(Paragraph("NEXUSVIP EXCHANGE & CASINO PLATFORM", subtitle_style))
    story.append(Paragraph("Strategic Domain Name Portfolio & Brand Guide", title_style))
    story.append(Spacer(1, 2))
    story.append(Paragraph("Executive Partner Selection Document • Production Architecture • August 2026", ParagraphStyle('DateLine', fontName='Helvetica', fontSize=8, textColor=colors.HexColor('#64748b'))))
    story.append(Spacer(1, 6))

    # 2. Executive Context Card
    exec_summary_html = """
    <b>Project Overview:</b> A high-liquidity Sports Betting Exchange & Indian Live Casino platform featuring real-world Betfair odds, peer-to-peer Back & Lay matching, automated multi-bank/UPI/USDT cashier gateways, and a 5-tier agent credit downline.<br/>
    <b>Objective:</b> Select a brand domain name that maximizes player trust, high-roller deposit conversion, WhatsApp/Telegram campaign deliverability, and organic cricket search ranking.
    """
    summary_table = Table([[Paragraph(exec_summary_html, callout_style)]], colWidths=[letter[0] - 64])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 6))

    # Helper function for tables
    def build_category_table(data_rows):
        formatted_rows = [
            [
                Paragraph("<b>Domain Idea</b>", table_header_style),
                Paragraph("<b>Recommended TLDs</b>", table_header_style),
                Paragraph("<b>Strategic Positioning & Player Appeal</b>", table_header_style),
                Paragraph("<b>Best For</b>", table_header_style)
            ]
        ]
        for row in data_rows:
            formatted_rows.append([
                Paragraph(f"<b>{row[0]}</b>", domain_name_style),
                Paragraph(row[1], badge_style),
                Paragraph(row[2], cell_style),
                Paragraph(row[3], cell_style)
            ])

        t = Table(formatted_rows, colWidths=[120, 115, 205, 108])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('LEFTPADDING', (0,0), (-1,-1), 5),
            ('RIGHTPADDING', (0,0), (-1,-1), 5),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')])
        ]))
        return t

    # 3. Category 1: Premium & VIP Tier
    story.append(Paragraph("1. Premium & VIP Tier (Luxury, High-Roller, Trust)", cat_header_style))
    story.append(Paragraph("Tailored for high-stakes punters, syndicate liquidity, and establishing an elite VIP club presence.", body_style))
    
    cat1_data = [
        ["NexusVIP", ".bet, .exchange, .vip, .io", "Direct match with current platform UI, commands luxury & prestige.", "Primary Brand"],
        ["AuraBet / AuraVIP", ".com, .bet, .in, .vip", "Clean, futuristic, high-recall name. Feels like an exclusive private club.", "VIP Syndicates"],
        ["ApexExchange", ".bet, .io, .pro, .exchange", "Signals peak odds, zero slippage, and maximum market liquidity.", "Pro Traders"],
        ["CrownBet365", ".vip, .club, .in, .live", "Classic regal betting aesthetic; familiar layout converts instantly.", "Mass Market"],
        ["VeloxVIP", ".bet, .io, .club", "Latin for 'speed' — highlights instant UPI/USDT deposit and cashout speeds.", "Fast Cashouts"],
        ["SovereignBet", ".exchange, .vip, .com", "High-trust institutional tone; ideal for large master agent networks.", "Agent Downline"]
    ]
    story.append(build_category_table(cat1_data))
    story.append(Spacer(1, 6))

    # 4. Category 2: Exchange & P2P Trading Focus
    story.append(Paragraph("2. Exchange & P2P Trading Focus (Betfair / OrbitX Style)", cat_header_style))
    story.append(Paragraph("Designed for users seeking authentic Back & Lay exchange trading, bookmaker hedging, and raw market depth.", body_style))

    cat2_data = [
        ["MatchXchange", ".io, .bet, .pro, .exchange", "Clear, self-explanatory messaging that users bet against peers.", "P2P Exchange"],
        ["ProBetX", ".bet, .in, .exchange, .app", "Punchy, modern sportsbook brand; looks razor-sharp on mobile app icons.", "Mobile / Apps"],
        ["OrbitBet / OrbitVIP", ".exchange, .in, .live", "Betfair-syndicate aesthetic with proven global conversion track record.", "Cricket Hedging"],
        ["FairOddsX", ".com, .io, .bet, .live", "Directly targets player demand for transparent, zero-rigging odds.", "Player Trust"],
        ["AlphaExchange", ".bet, .pro, .live, .in", "Authoritative market-maker vibe; conveys top-tier exchange volume.", "High Liquidity"],
        ["TradeOdds24", ".exchange, .io, .com", "Financial market framing — appeals to smart-money sports arbitrageurs.", "Arbitrage / Quant"]
    ]
    story.append(build_category_table(cat2_data))

    # Clean Page Break -> Page 2
    story.append(PageBreak())

    # 5. Category 3: Cricket & Indian Market Powerhouses
    story.append(Paragraph("3. Cricket & Indian Market Powerhouses (High Local Recall)", cat_header_style))
    story.append(Paragraph("Optimized for IPL seasons, bilateral cricket series, Teen Patti, Andar Bahar, and domestic traffic acquisition.", body_style))

    cat3_data = [
        ["CricWinVIP", ".in, .live, .bet, .club", "Instant recognition across Indian cricket fans and fantasy sports punters.", "IPL & Bilaterals"],
        ["FairWin247", ".club, .in, .live, .bet", "24/7 reliability motif; highly trusted phrasing in desi betting markets.", "Everyday Punters"],
        ["DesiBetX / DesiEx", ".in, .vip, .live, .bet", "Direct emotional resonance for Indian Casino (Teen Patti/Lucky 7) & Cricket.", "Local Casino"],
        ["SixerExchange", ".in, .bet, .live, .app", "Action-packed sports terminology; viral appeal during T20 matches.", "T20 Leagues"],
        ["RoyalCric9", ".in, .com, .vip, .bet", "Lucky number '9' + Royal prefix; top converting structure in Asian markets.", "Asian Markets"],
        ["BharatExchange", ".in, .live, .bet", "Strong national identity and localized pride for domestic player bases.", "Desi Audience"]
    ]
    story.append(build_category_table(cat3_data))
    story.append(Spacer(1, 6))

    # 6. Category 4: Ultra-Short, Modern & App Ready
    story.append(Paragraph("4. Ultra-Short, Modern & Mobile App Ready (PWA / APK)", cat_header_style))
    story.append(Paragraph("Short character count (3-6 chars) for effortless mobile typing, SMS campaigns, and WhatsApp referrals.", body_style))

    cat4_data = [
        ["NX9 / NXBet", ".vip, .bet, .live, .in", "Ultra-compact branding; fits perfectly in app icons and mobile headers.", "App Icon / PWA"],
        ["PlayX24", ".in, .bet, .pro, .live", "Energetic, dynamic, non-stop action appeal.", "Young Demographics"],
        ["ZepBet / ZepEx", ".io, .bet, .vip, .app", "Fintech / crypto gaming tone; appeals to modern USDT & instant UPI users.", "USDT Crypto Users"],
        ["BoltOdds", ".live, .bet, .in, .pro", "Symbolizes lightning-fast 1-click betting and sub-second price updates.", "In-Play Live Bets"]
    ]
    story.append(build_category_table(cat4_data))
    story.append(Spacer(1, 6))

    # 7. Strategic Extension (TLD) Evaluation Guide
    story.append(Paragraph("5. Domain Extension (TLD) Strategy Matrix", cat_header_style))
    story.append(Paragraph("Choosing the right extension is as important as the name itself for trust, deliverability, and traffic:", body_style))

    tld_rows = [
        [
            Paragraph("<b>Extension</b>", table_header_style),
            Paragraph("<b>Key Strength</b>", table_header_style),
            Paragraph("<b>Strategic Utility for Our Platform</b>", table_header_style)
        ],
        [
            Paragraph("<b>.bet</b>", domain_name_style),
            Paragraph("Global Industry Authority", badge_style),
            Paragraph("Leaves zero ambiguity about platform offerings; preferred by sports punters worldwide.", cell_style)
        ],
        [
            Paragraph("<b>.exchange</b>", domain_name_style),
            Paragraph("P2P Trading Distinction", badge_style),
            Paragraph("Instantly distinguishes your site from standard fixed-odds bookmakers to Betfair players.", cell_style)
        ],
        [
            Paragraph("<b>.vip</b>", domain_name_style),
            Paragraph("High-Roller Exclusivity", badge_style),
            Paragraph("Creates premium brand equity; highly effective for Telegram VIP channels and agent downlines.", cell_style)
        ],
        [
            Paragraph("<b>.in</b>", domain_name_style),
            Paragraph("Indian Geographic Authority", badge_style),
            Paragraph("Builds immediate domestic trust with UPI depositors and localized cricket search traffic.", cell_style)
        ],
        [
            Paragraph("<b>.io / .live</b>", domain_name_style),
            Paragraph("Modern Tech & In-Play Feel", badge_style),
            Paragraph("Ideal for streaming live match telemetry, interactive score centers, and crypto deposits.", cell_style)
        ]
    ]

    tld_table = Table(tld_rows, colWidths=[70, 140, 338])
    tld_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')])
    ]))
    story.append(tld_table)
    story.append(Spacer(1, 6))

    # 8. Partner Decision Checklist & Recommendations
    recommendation_box_html = """
    <b>🎯 Top 3 Recommended Action Plans for You and Your Partner:</b><br/>
    <b>1. Primary Brand Recommendation:</b> <u><b>NexusVIP.exchange</b></u> or <u><b>NexusVIP.bet</b></u> — Seamlessly matches the live platform branding, header logos, and backend.<br/>
    <b>2. Desi Market Specialist:</b> <u><b>CricWinVIP.in</b></u> or <u><b>FairWin247.vip</b></u> — Massive organic conversion for cricket seasons, IPL, and Teen Patti card rooms.<br/>
    <b>3. Mirror / Traffic Architecture:</b> Register 1 primary hub (e.g. <i>NexusVIP.exchange</i>) + 1 mirror backup (e.g. <i>NexusVIP.in</i> or <i>NXBet.live</i>) for WhatsApp link distribution and SMS promotions.
    """
    rec_table = Table([[Paragraph(recommendation_box_html, callout_style)]], colWidths=[letter[0] - 64])
    rec_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#fff7ed')),
        ('BOX', (0,0), (-1,-1), 1.2, colors.HexColor('#f36c21')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
    ]))
    story.append(rec_table)

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {output_filename}")

if __name__ == '__main__':
    out_dir = r"d:\Sports_Betting_Specifications\assets"
    os.makedirs(out_dir, exist_ok=True)
    pdf_path = os.path.join(out_dir, "NexusVIP_Domain_Selection_Portfolio.pdf")
    build_domain_pdf(pdf_path)

    # Also copy to player-portal/public for direct web download
    web_public_dir = r"d:\Sports_Betting_Specifications\services\player-portal\public"
    os.makedirs(web_public_dir, exist_ok=True)
    web_pdf_path = os.path.join(web_public_dir, "NexusVIP_Domain_Selection_Portfolio.pdf")
    build_domain_pdf(web_pdf_path)
