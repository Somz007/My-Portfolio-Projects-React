from flask import Flask

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev-secret-key'


@app.route('/')
def index():
    return '<h1>Flask Microblog</h1>'


if __name__ == '__main__':
    app.run(debug=True)
