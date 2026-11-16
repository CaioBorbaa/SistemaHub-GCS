import os
import time
import requests
from flask import Flask, render_template, Response, jsonify, request, session, redirect, url_for
from dotenv import load_dotenv
import mysql.connector
from functools import wraps
from mysql.connector import Error

load_dotenv()

app = Flask(__name__)

app.secret_key = os.getenv('SECRET_KEY')

# --- Configurações de Cache ---
weather_cache = {}
CACHE_DURATION = 1800  # 30 minutos em segundos

# --- Mapeamento de Ícones do Clima ---
WEATHER_ICON_MAP = {
    "storm": "wind.svg",
    "snow": "cloud-snow.svg", 
    "hail": "cloud-drizzle.svg",
    "rain": "cloud-rain.svg",
    "fog": "align-justify.svg",
    "clear_day": "sun.svg",
    "clear_night": "moon.svg",
    "cloud": "cloud.svg",
    "cloudly_day": "cloud.svg",
    "cloudly_night": "cloud.svg",
    "none_day": "sun.svg",
    "none_night": "moon.svg",
}

# --- Funções de Banco de Dados ---
def get_db_connection():
    """Estabelece conexão com o banco de dados MySQL"""
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME'),
            charset='utf8',
            autocommit=True
        )
        return conn
    except Error as e:
        print(f"Erro ao conectar ao banco de dados: {e}")
        return None

def fetch_links():
    """Busca os links organizados por categoria"""
    conn = get_db_connection()
    if not conn:
        return {}
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        sql_query = """
            SELECT l.id, l.nome, l.url, c.nome AS categoria
            FROM links AS l
            JOIN link_categorias AS lc ON l.id = lc.link_id
            JOIN categorias AS c ON lc.categoria_id = c.id
            WHERE l.ativo = 1
            ORDER BY c.ordem, c.nome, l.ordem;
        """
        
        cursor.execute(sql_query)
        links_flat = cursor.fetchall()
        
        # Organiza os links por categoria
        categorias_agrupadas = {}
        for link in links_flat:
            cat = link['categoria']
            if cat not in categorias_agrupadas:
                categorias_agrupadas[cat] = []
            
            # Evita duplicatas
            if not any(d.get('id') == link['id'] for d in categorias_agrupadas[cat]):
                categorias_agrupadas[cat].append(link)
        
        return categorias_agrupadas
        
    except Error as e:
        print(f"Erro ao buscar links: {e}")
        return {}
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def fetch_categorias():
    """Busca as categorias para os botões de filtro"""
    conn = get_db_connection()
    if not conn:
        return []
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT nome, ordem FROM categorias WHERE nome != 'geral' ORDER BY ordem")
        categorias = cursor.fetchall()
        return categorias
        
    except Error as e:
        print(f"Erro ao buscar categorias: {e}")
        return []
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def fetch_banners():
    """Busca os banners ativos ordenados"""
    conn = get_db_connection()
    if not conn:
        return []

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT imagem_nome, link_url FROM banners WHERE ativo = 1 ORDER BY ordem")
        banners = cursor.fetchall()
        return banners
    except Error as e:
        print(f"Erro ao buscar banners: {e}")
        return []
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            # Se o usuário não estiver logado, redireciona para a página de login
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# --- Rotas da Aplicação ---
@app.route('/')
@login_required
def home():
    """Página principal do hub"""
    todos_os_links_agrupados = fetch_links()
    categorias_botoes = fetch_categorias()
    banners_ativos = fetch_banners()
    
    return render_template(
        'index.html',
        todos_os_links=todos_os_links_agrupados,
        categorias_botoes=categorias_botoes,
        banners=banners_ativos
    )

@app.route('/imagem/<int:projeto_id>')
@login_required
def get_imagem(projeto_id):
    """Retorna a imagem de um projeto específico"""
    conn = get_db_connection()
    if not conn:
        return 'Erro de conexão', 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT imagem FROM links WHERE id = %s", (projeto_id,))
        resultado = cursor.fetchone()
        
        if resultado and resultado['imagem']:
            return Response(resultado['imagem'], mimetype='image/png')
        return 'Imagem não encontrada', 404
        
    except Error as e:
        print(f"Erro ao buscar imagem: {e}")
        return 'Erro interno', 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/login', methods=['GET', 'POST'])
def login():
    # Se o método for POST, o formulário foi enviado
    if request.method == 'POST':
        cpf = request.form.get('cpf')
        # Remove caracteres não numéricos do CPF
        cpf_limpo = ''.join(filter(str.isdigit, cpf))

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Procura por um usuário ativo com o CPF fornecido
        cursor.execute("SELECT id, nome_completo, nivel_acesso FROM usuarios WHERE cpf = %s AND ativo = 1", (cpf_limpo,))
        user = cursor.fetchone()
        
        cursor.close()
        conn.close()

        if user:
            # Se encontrou o usuário, armazena suas informações na "memória" (sessão)
            session['user_id'] = user['id']
            session['user_name'] = user['nome_completo']
            session['user_level'] = user['nivel_acesso']

        try:
            nomes = user['nome_completo'].split()
            if len(nomes) > 1:
                iniciais = nomes[0][0] + nomes[-1][0]
            else:
                iniciais = nomes[0][:2]
            session['user_initials'] = iniciais.upper()
        except:
            session['user_initials'] = 'U' # 'U' de Usuário como padrão

            # Redireciona para a página principal
            return redirect(url_for('home'))
        else:
            # Se não encontrou, mostra uma mensagem de erro na tela de login
            error = "CPF não encontrado ou inativo. Por favor, contate o RH."
            return render_template('login.html', error=error)

    # Se o método for GET, apenas mostra a página de login
    return render_template('login.html')

@app.route('/logout')
def logout():
    # Limpa todas as informações da sessão
    session.clear()
    # Redireciona para a tela de login
    return redirect(url_for('login'))

@app.route('/api/local-weather')
def get_local_weather():
    """API para obter o clima local baseado no IP do usuário"""
    user_ip = request.headers.get('X-Forwarded-For', request.remote_addr)
    
    # Para desenvolvimento local
    if user_ip == '127.0.0.1':
        user_ip = '200.233.220.149'

    current_time = time.time()
    
    # Verifica cache
    if user_ip in weather_cache and current_time - weather_cache[user_ip]['timestamp'] < CACHE_DURATION:
        return jsonify(weather_cache[user_ip]['data'])

    # Busca localização baseada no IP
    try:
        geo_url = f'http://ip-api.com/json/{user_ip}'
        geo_response = requests.get(geo_url, timeout=10)
        geo_response.raise_for_status()
        geo_data = geo_response.json()
        
        city = geo_data.get('city')
        if not city:
            return jsonify({"error": "Cidade indisponível"}), 404
            
    except requests.exceptions.RequestException as e:
        print(f"Erro na API de geolocalização: {e}")
        return jsonify({"error": "Serviço de localização indisponível"}), 503

    # Busca dados do clima
    try:
        api_key = os.getenv('HG_WEATHER_API_KEY')
        if not api_key:
            return jsonify({"error": "Chave de API não configurada"}), 500
        
        weather_url = f"https://api.hgbrasil.com/weather?city_name={city}&key={api_key}"
        weather_response = requests.get(weather_url, timeout=10)
        weather_response.raise_for_status()
        weather_data = weather_response.json()

        results = weather_data.get('results', {})
        final_data = {
            "city": city.upper(),
            "temp": f"{results.get('temp')}°C",
            "desc": results.get('description'),
            "icon": WEATHER_ICON_MAP.get(results.get('condition_slug'), "cloud.svg")
        }
        
        # Salva no cache
        weather_cache[user_ip] = {
            'data': final_data, 
            'timestamp': current_time
        }
        
        return jsonify(final_data)
        
    except requests.exceptions.RequestException as e:
        print(f"Erro na API de clima: {e}")
        return jsonify({"error": "Serviço de clima indisponível"}), 503

@app.route('/debug')
def debug_links():
    """Rota de debug para verificar dados"""
    todos_os_links = fetch_links()
    categorias = fetch_categorias()
    
    return jsonify({
        "status": "ok",
        "links_count": {categoria: len(links) for categoria, links in todos_os_links.items()},
        "links": todos_os_links,
        "categorias": categorias,
        "total_systems": sum(len(links) for links in todos_os_links.values())
    })

@app.route('/health')
def health_check():
    """Endpoint para verificação de saúde da aplicação"""
    return jsonify({
        "status": "healthy",
        "timestamp": time.time(),
        "cache_size": len(weather_cache)
    })

# --- Tratamento de Erros ---
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500

# --- Configurações de Desenvolvimento ---
if __name__ == '__main__':
    # Configurações para desenvolvimento
    app.config['DEBUG'] = True
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    
    print("🚀 Hub Tintomax iniciando...")
    print(f"📍 Host do banco: {os.getenv('DB_HOST', 'Não configurado')}")
    print(f"🌤️  API do clima: {'Configurada' if os.getenv('HG_WEATHER_API_KEY') else 'Não configurada'}")
    
    app.run(debug=True, host='127.0.0.1', port=5000)