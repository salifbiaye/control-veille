from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_LEFT, TA_CENTER

OUTPUT = "DEPLOY-GUIDE.pdf"

doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=A4,
    leftMargin=2*cm, rightMargin=2*cm,
    topMargin=2*cm, bottomMargin=2*cm,
)

W = A4[0] - 4*cm  # usable width

# ── Styles ────────────────────────────────────────────────────────────────────
s = getSampleStyleSheet()

title_style = ParagraphStyle("Title2", parent=s["Title"],
    fontSize=22, textColor=colors.HexColor("#1F3864"),
    spaceAfter=4, alignment=TA_CENTER)

subtitle_style = ParagraphStyle("Sub", parent=s["Normal"],
    fontSize=11, textColor=colors.HexColor("#4472C4"),
    spaceAfter=20, alignment=TA_CENTER)

h1 = ParagraphStyle("H1", parent=s["Heading1"],
    fontSize=13, textColor=colors.white,
    backColor=colors.HexColor("#2E74B5"),
    spaceBefore=18, spaceAfter=8,
    leftIndent=-2, rightIndent=-2,
    borderPad=6)

h2 = ParagraphStyle("H2", parent=s["Heading2"],
    fontSize=11, textColor=colors.HexColor("#1F3864"),
    spaceBefore=10, spaceAfter=4)

body = ParagraphStyle("Body", parent=s["Normal"],
    fontSize=9.5, leading=14, spaceAfter=4)

code_style = ParagraphStyle("Code", parent=s["Normal"],
    fontSize=8.5, fontName="Courier",
    backColor=colors.HexColor("#F2F2F2"),
    textColor=colors.HexColor("#1F497D"),
    leftIndent=12, rightIndent=12,
    borderPad=5, leading=13, spaceAfter=2)

note_style = ParagraphStyle("Note", parent=s["Normal"],
    fontSize=8.5, textColor=colors.HexColor("#7F7F7F"),
    leftIndent=10, spaceAfter=6)

bullet_style = ParagraphStyle("Bullet", parent=body,
    leftIndent=14, bulletIndent=4, spaceAfter=3)

# ── Helpers ───────────────────────────────────────────────────────────────────
def h(text): return Paragraph(text, h1)
def p(text): return Paragraph(text, body)
def code(text): return Paragraph(text, code_style)
def note(text): return Paragraph(f"<i>{text}</i>", note_style)
def b(text): return Paragraph(f"• {text}", bullet_style)
def sp(n=6): return Spacer(1, n)
def hr(): return HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#BFBFBF"), spaceAfter=6)

def schema_table(rows):
    t = Table(rows, colWidths=[W])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#F8F8F8")),
        ("FONTNAME", (0,0), (-1,-1), "Courier"),
        ("FONTSIZE", (0,0), (-1,-1), 8),
        ("TEXTCOLOR", (0,0), (-1,-1), colors.HexColor("#1F497D")),
        ("LEFTPADDING", (0,0), (-1,-1), 10),
        ("RIGHTPADDING", (0,0), (-1,-1), 10),
        ("TOPPADDING", (0,0), (-1,-1), 3),
        ("BOTTOMPADDING", (0,0), (-1,-1), 3),
        ("BOX", (0,0), (-1,-1), 0.5, colors.HexColor("#C9C9C9")),
    ]))
    return t

# ── Content ───────────────────────────────────────────────────────────────────
story = []

story += [
    Paragraph("Guide Deploiement Admin + Twingate", title_style),
    Paragraph("Veille App — VPS Linux + Acces Prive", subtitle_style),
    hr(), sp(10),
]

# Section 1
story += [
    h("1. Architecture"),
    p("Le setup est compose de trois composants isoles sur un reseau Docker interne :"),
    b("App Admin (Next.js) : container Docker, port 3001, NON expose publiquement"),
    b("Twingate Connector : container Docker, cree un tunnel sortant vers les serveurs Twingate"),
    b("Reseau Docker 'internal' : seuls les deux containers se voient"),
    sp(8),
    p("<b>Schema de connexion :</b>"),
    schema_table([["Ton PC (client Twingate)  ->  Serveurs Twingate (cloud)  ->  Connector (VPS)  ->  veille-admin:3001"]]),
    sp(4),
]

# Section 2
story += [
    h("2. Prerequis"),
    b("Compte Docker Hub — hub.docker.com"),
    b("Compte Twingate — app.twingate.com (gratuit)"),
    b("VPS Linux avec acces SSH"),
    b("Docker installe en local (Windows)"),
]

# Section 3
story += [
    h("3. Etape 1 — Build & Push Docker (PC Windows)"),
    p("Depuis le terminal Windows dans le dossier admin :"),
    schema_table([
        ["cd C:\\Users\\DELL\\Downloads\\veille\\admin"],
        ["docker login"],
        ["docker build -t gdxebec/veille-admin:latest ."],
        ["docker push gdxebec/veille-admin:latest"],
    ]),
]

# Section 4
story += [
    h("4. Etape 2 — Configurer Twingate (navigateur)"),
    b("Aller sur app.twingate.com -> creer un compte"),
    b("Networks -> Add -> nom : monvps"),
    b("Remote Networks -> Add -> coller l'IP du VPS"),
    b("Connectors -> Add Connector -> Docker -> copier les 3 tokens (TWINGATE_NETWORK, ACCESS_TOKEN, REFRESH_TOKEN)"),
    b("Resources -> Add Resource : Address = veille-admin | Port = 3001 | Assigner au Remote Network monvps"),
    b("Access -> assigner la resource a son compte utilisateur"),
]

# Section 5
story += [
    h("5. Etape 3 — Preparer le VPS"),
    schema_table([
        ["ssh user@IP_DU_VPS"],
        ["curl -fsSL https://get.docker.com | sh"],
        ["mkdir ~/admin && cd ~/admin"],
    ]),
]

# Section 6
story += [
    h("6. Etape 4 — Fichier .env sur le VPS"),
    code("nano .env"),
    sp(4),
    p("Contenu complet du fichier .env :"),
    schema_table([
        ["DATABASE_URL=postgresql://postgres.fmsxahuzynldjfhwbzjx:MOT_DE_PASSE_ENCODE@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"],
        ["BETTER_AUTH_SECRET=une-chaine-aleatoire-longue-minimum-32-caracteres"],
        ["BETTER_AUTH_URL=http://veille-admin:3001"],
        ["NEXT_PUBLIC_BETTER_AUTH_URL=http://veille-admin:3001"],
        ["PAYMENT_PROVIDER=stripe"],
        ["STRIPE_SECRET_KEY=sk_live_xxx"],
        ["PADDLE_API_KEY="],
        ["PADDLE_ENVIRONMENT=sandbox"],
        ["TWINGATE_NETWORK=monvps.twingate.com"],
        ["TWINGATE_ACCESS_TOKEN=TOKEN_COPIE_DEPUIS_TWINGATE"],
        ["TWINGATE_REFRESH_TOKEN=TOKEN_COPIE_DEPUIS_TWINGATE"],
    ]),
    sp(4),
    note("Note : Caracteres speciaux a URL-encoder dans le mot de passe :  # -> %23  |  & -> %26  |  % -> %25  |  @ -> %40"),
]

# Section 7
story += [
    h("7. Etape 5 — Transferer le docker-compose sur le VPS"),
    p("Depuis le PC Windows :"),
    schema_table([["scp docker-compose.yml user@IP_DU_VPS:~/admin/"]]),
]

# Section 8
story += [
    h("8. Etape 6 — Lancer les containers"),
    schema_table([
        ["cd ~/admin"],
        ["docker compose up -d"],
        ["docker ps"],
    ]),
    sp(4),
    p("Resultat attendu : les deux containers <b>veille-admin</b> et <b>twingate-connector</b> en statut <b>Up</b>."),
]

# Section 9
story += [
    h("9. Etape 7 — Installer le client Twingate sur le PC"),
    b("Telecharger Twingate client sur twingate.com/download"),
    b("Installer et ouvrir l'application"),
    b("Se connecter avec son compte : monvps.twingate.com"),
    b("Activer le reseau dans l'interface client"),
]

# Section 10
story += [
    h("10. Etape 8 — Acceder a l'admin"),
    p("Ouvrir le navigateur :"),
    schema_table([["http://veille-admin:3001"]]),
    sp(4),
    p("Le client Twingate resout automatiquement 'veille-admin' vers le container via le tunnel. Entrer son email -> recevoir un OTP -> acceder au dashboard."),
]

# Section 11
story += [
    h("11. Mise a jour de l'image"),
    p("<b>Sur le PC :</b>"),
    schema_table([
        ["docker build -t gdxebec/veille-admin:latest ."],
        ["docker push gdxebec/veille-admin:latest"],
    ]),
    sp(4),
    p("<b>Sur le VPS :</b>"),
    schema_table([
        ["cd ~/admin"],
        ["docker compose pull"],
        ["docker compose up -d"],
    ]),
]

# Section 12
story += [
    h("12. docker-compose.yml — Reference complete"),
    schema_table([
        ["services:"],
        ["  admin:"],
        ["    image: gdxebec/veille-admin:latest"],
        ["    container_name: veille-admin"],
        ["    restart: unless-stopped"],
        ["    environment:"],
        ["      - DATABASE_URL=${DATABASE_URL}"],
        ["      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}"],
        ["      - BETTER_AUTH_URL=${BETTER_AUTH_URL}"],
        ["      - NEXT_PUBLIC_BETTER_AUTH_URL=${NEXT_PUBLIC_BETTER_AUTH_URL}"],
        ["      - PAYMENT_PROVIDER=${PAYMENT_PROVIDER:-stripe}"],
        ["      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}"],
        ["    networks:"],
        ["      - internal"],
        [""],
        ["  twingate:"],
        ["    image: twingate/connector:latest"],
        ["    container_name: twingate-connector"],
        ["    restart: unless-stopped"],
        ["    environment:"],
        ["      - TWINGATE_NETWORK=${TWINGATE_NETWORK}"],
        ["      - TWINGATE_ACCESS_TOKEN=${TWINGATE_ACCESS_TOKEN}"],
        ["      - TWINGATE_REFRESH_TOKEN=${TWINGATE_REFRESH_TOKEN}"],
        ["    sysctls:"],
        ["      - net.ipv4.ping_group_range=0 2147483647"],
        ["    networks:"],
        ["      - internal"],
        [""],
        ["networks:"],
        ["  internal:"],
        ["    driver: bridge"],
    ]),
]

# Section 13
story += [
    h("13. Depannage"),
    p("<b>Cannot connect to veille-admin:3001</b>"),
    note("-> Verifier que le client Twingate est connecte et que le reseau est actif."),
    p("<b>Container twingate-connector en erreur</b>"),
    note("-> Verifier les 3 tokens dans le .env (copier exactement depuis le dashboard Twingate)."),
    p("<b>Container admin redemarre en boucle</b>"),
    schema_table([["docker logs veille-admin"]]),
    note("-> Verifier les variables d'environnement manquantes."),
    p("<b>Erreur Prisma / base de donnees</b>"),
    note("-> Verifier DATABASE_URL avec mot de passe URL-encode et utiliser le Session Pooler Supabase."),
]

doc.build(story)
print("PDF cree :", OUTPUT)
