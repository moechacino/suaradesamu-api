from flask import Flask, request, jsonify
from transformers import pipeline

app = Flask(__name__)

pretrained_name = "w11wo/indonesian-roberta-base-sentiment-classifier"
nlp = pipeline(
    "sentiment-analysis",
    model=pretrained_name,
    tokenizer=pretrained_name
)

def predict_sentiment(text):
    result = nlp(text)
    sentiment = result[0]['label']
    return sentiment

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    text = data['text']
    sentiment = predict_sentiment(text)
    return jsonify({'sentiment': sentiment})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
