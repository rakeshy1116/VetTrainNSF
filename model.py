import os
import joblib
import pandas as pd

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'api_dev_model_binary_text.pkl')


def load_model(input_data):
    """Load the pre-trained model and return predictions for the given answer text."""
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f'Model file not found: {MODEL_PATH}')

    new_data = pd.DataFrame({'answer_transcript': [input_data]})
    loaded_model = joblib.load(MODEL_PATH)
    predictions = loaded_model.predict(new_data)
    return predictions
