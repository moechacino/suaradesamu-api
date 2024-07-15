from flask import Flask, request, jsonify
from transformers import pipeline
import pandas as pd
from tempfile import NamedTemporaryFile

app = Flask(__name__)

pretrained_name = "w11wo/indonesian-roberta-base-sentiment-classifier"
nlp = pipeline(
    "sentiment-analysis",
    model=pretrained_name,
    tokenizer=pretrained_name
)

def analyze_sentiment(text):
    if not isinstance(text, str):
        return 'unknown'  
    result = nlp(text)
    return result[0]['label']

@app.route('/analyze', methods=['POST'])
def analyze():
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']

    temp_file = NamedTemporaryFile(delete=False)
    file.save(temp_file.name)

    try:
        df = pd.read_excel(temp_file.name)
    except Exception as e:
        return jsonify({'error': f'Failed to read Excel file: {str(e)}'}), 400

   
    df['Comment'] = df['Comment'].astype(str)

    df['Sentiment'] = df['Comment'].apply(analyze_sentiment)

    positive_percentage = (df[df['Sentiment'] == 'positive'].shape[0] / df.shape[0]) * 100
    negative_percentage = (df[df['Sentiment'] == 'negative'].shape[0] / df.shape[0]) * 100

    oldest_date = df['Date'].min()
    newest_date = df['Date'].max()

    temp_file.close()

    return jsonify({
        'positive_percentage': positive_percentage,
        'negative_percentage': negative_percentage,
        'oldest_date': oldest_date,
        'newest_date': newest_date
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
