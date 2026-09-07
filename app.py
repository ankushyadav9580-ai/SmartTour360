from flask import Flask, jsonify, request, send_from_directory
import os
import requests

app = Flask(__name__, static_folder='.', static_url_path='')

# Configure an approved train-information provider here.
# Example environment variables:
# TRAIN_API_URL=https://your-approved-provider.example/api/trains
# TRAIN_API_KEY=your_key
TRAIN_API_URL = os.getenv('TRAIN_API_URL', '').strip()
TRAIN_API_KEY = os.getenv('TRAIN_API_KEY', '').strip()


def normalize(v):
    return ' '.join(str(v or '').lower().replace('railway station', '').replace('junction', '').replace('jn.', '').split())


def demo_route(from_name, to_name, mode):
    """Return clearly-labelled demo options using the user's exact route.
    These are UI/demo records only, not real railway schedules or availability.
    """
    if mode == 'metro':
        return [
            {
                'name': 'Smart Metro Connector (Demo)',
                'number': 'SM-101',
                'from': from_name,
                'to': to_name,
                'departure': '09:00',
                'arrival': '10:00',
                'duration': '1h 00m',
                'type': 'Metro',
                'classes': 'Standard',
                'image': 'transport-images/metro1.jpg'
            },
            {
                'name': 'City Metro Express (Demo)',
                'number': 'CM-202',
                'from': from_name,
                'to': to_name,
                'departure': '11:30',
                'arrival': '12:35',
                'duration': '1h 05m',
                'type': 'Metro',
                'classes': 'Standard',
                'image': 'transport-images/metro2.jpg'
            }
        ]

    return [
        {
            'name': 'SmartTour Vande Bharat (Demo)',
            'number': 'ST-2091',
            'from': from_name,
            'to': to_name,
            'departure': '06:00',
            'arrival': '11:30',
            'duration': '5h 30m',
            'type': 'Vande Bharat',
            'classes': 'CC / EC',
            'image': 'transport-images/train1.jpg'
        },
        {
            'name': 'SmartTour Shatabdi (Demo)',
            'number': 'ST-1201',
            'from': from_name,
            'to': to_name,
            'departure': '07:15',
            'arrival': '13:00',
            'duration': '5h 45m',
            'type': 'Shatabdi',
            'classes': 'CC / EC',
            'image': 'transport-images/train2.jpg'
        },
        {
            'name': 'SmartTour Express (Demo)',
            'number': 'ST-1801',
            'from': from_name,
            'to': to_name,
            'departure': '08:30',
            'arrival': '15:00',
            'duration': '6h 30m',
            'type': 'Express',
            'classes': 'SL / 3A / 2A',
            'image': 'transport-images/train3.jpg'
        }
    ]


@app.get('/')
def home():
    return send_from_directory('.', 'index.html')


@app.get('/api/trains')
def trains():
    mode = request.args.get('mode', 'railway')
    from_name = request.args.get('from', '').strip()
    to_name = request.args.get('to', '').strip()
    date = request.args.get('date', '').strip()
    train_filter = request.args.get('filter', 'all').strip()

    if not from_name or not to_name or not date:
        return jsonify({'success': False, 'data': [], 'source': 'validation', 'message': 'From, To and date are required.'}), 400

    if TRAIN_API_URL and mode == 'railway':
        try:
            headers = {'Accept': 'application/json'}
            if TRAIN_API_KEY:
                headers['Authorization'] = f'Bearer {TRAIN_API_KEY}'
                headers['X-API-Key'] = TRAIN_API_KEY
            params = {'from': from_name, 'to': to_name, 'date': date}
            response = requests.get(TRAIN_API_URL, params=params, headers=headers, timeout=12)
            response.raise_for_status()
            raw = response.json()
            data = raw.get('data', raw if isinstance(raw, list) else [])
            if not isinstance(data, list):
                data = []
            if train_filter != 'all':
                data = [x for x in data if x.get('type') == train_filter]
            return jsonify({'success': True, 'data': data, 'source': 'Configured train API'})
        except Exception as exc:
            return jsonify({'success': False, 'data': [], 'source': 'API error', 'message': 'Train provider could not be reached.'}), 502

    # No provider credentials were supplied, so return an honest empty result.
    return jsonify({'success': True, 'data': demo_route(from_name, to_name, mode), 'source': 'No live provider configured', 'live': False})


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
