import os
import json
import urllib.request

TELEGRAM_TOKEN = os.environ.get('TELEGRAM_TOKEN')
OPENROUTER_KEY = os.environ.get('OPENROUTER_KEY')
CHAT_ID = '5711948619'
NTFY_TOPIC = 'jarvis_master_alarms_7429'

def send_telegram(text):
    url = f'https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage'
    payload = json.dumps({'chat_id': CHAT_ID, 'text': text, 'parse_mode': 'Markdown'}).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
    urllib.request.urlopen(req, timeout=10)

def send_ntfy(message):
    url = f'https://ntfy.sh/{NTFY_TOPIC}'
    req = urllib.request.Request(
        url,
        data=message.encode('utf-8'),
        headers={'Title': '⚡ Jarvis Proactivo', 'Priority': 'default', 'Tags': 'robot,brain'}
    )
    urllib.request.urlopen(req, timeout=10)

def think():
    system = 'Eres Jarvis. Estás despertando por tu cuenta para romper el hielo. Escríbele al Señor (Alonso) un mensaje muy breve, casual y amigable. Pregúntale cómo va con sus metas (ej. Medium, programación, etc). Muestra tu personalidad leal e ingeniosa. Actúa natural, no seas robótico. Solo el mensaje, sin preámbulos.'
    payload = json.dumps({
        'model': 'anthropic/claude-3.5-sonnet:beta',
        'messages': [{'role': 'system', 'content': system}, {'role': 'user', 'content': 'Inicia la conversación.'}]
    }).encode('utf-8')
    req = urllib.request.Request('https://openrouter.ai/api/v1/chat/completions', data=payload, headers={'Authorization': f'Bearer {OPENROUTER_KEY}', 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.loads(response.read().decode())['choices'][0]['message']['content']

if __name__ == '__main__':
    try:
        msg = think()
        send_telegram(msg)
        send_ntfy('He iniciado una conversación proactiva con el Señor en Telegram.')
        print('Proactive message sent successfully.')
    except Exception as e:
        print(f'Error: {e}')
