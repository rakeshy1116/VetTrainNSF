import os
from flask import Flask, request, render_template, jsonify
from flask_cors import CORS
import model

app = Flask(__name__)

# Restrict CORS to the frontend origin in production via env var
allowed_origin = os.environ.get('FRONTEND_ORIGIN', '*')
CORS(app, origins=allowed_origin)


@app.route('/health')
def health():
    return jsonify({'status': 'ok'})


@app.route('/')
def my_form():
    return render_template('input.html')


@app.route('/', methods=['POST'])
def predict():
    data = request.get_json(silent=True)
    if not data or 'answer' not in data:
        return jsonify({'error': 'Request body must be JSON with an "answer" field.'}), 400

    answer = data['answer'].strip()
    if not answer:
        return jsonify({'error': 'Answer cannot be empty.'}), 400

    try:
        predictions = model.load_model(answer)
        label = str(predictions[0])
        return jsonify({'Label': label, 'Reasoning': ''})
    except FileNotFoundError:
        return jsonify({'error': 'Model file not found on server.'}), 500
    except Exception as e:
        app.logger.error('Prediction error: %s', e)
        return jsonify({'error': 'An error occurred during prediction.'}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'true').lower() == 'true'
    app.run(debug=debug, port=port)
