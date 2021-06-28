import sys
import os
from flask import Flask
from flask_restful import Resource, Api
from flask_cors import CORS, cross_origin
from flask import request
from flask import render_template
import pprint
from datetime import datetime

# This wil report the electron exe location, and not the /tmp dir where the exe
# is actually expanded and run from!
print(f"flask is running in {os.getcwd()}, __name__ is {__name__}", flush=True)
# print(f"flask/python env is {os.environ}", flush=True)
print(sys.version, flush=True)
# print(os.environ, flush=True)
# print(os.getcwd(), flush=True)
# print("User's Environment variable:")
# pprint.pprint(dict(os.environ), width = 1)

base_dir = '.'
if hasattr(sys, '_MEIPASS'):
    print('detected bundled mode', sys._MEIPASS)
    base_dir = os.path.join(sys._MEIPASS)

# app = Flask(__name__)
app = Flask(__name__,
        static_folder=os.path.join(base_dir, 'static'),
        template_folder=os.path.join(base_dir, 'templates'))

app.config['DEBUG'] = True  # true will cause double load on startup
app.config['EXPLAIN_TEMPLATE_LOADING'] = False  # won't work unless debug is on

# CORS(app, origins='http://localhost:<%= portFlask %>')
CORS(app)

api = Api(app)

@api.resource('/')
# @cross_origin(origin='*')
class HelloWorld(Resource):
    def get(self):
        print(f"calling GET in python api - cool", flush=True)
        # print("some stderr", file=sys.stderr)
        # print("some stdout", file=sys.stdout, flush=True)
        data = {'hello': 'world', 'time': datetime.now().strftime("%H:%M:%S")}
        return data

@app.route('/hello')
def hello():
    return render_template('hello.html', msg="YOU")

@app.route('/hello-vue')
def hello_vue():
    return render_template('hello-vue.html', msg="WELCOME 🌻")

if __name__ == "__main__":
    # app.run()
    app.run(host="localhost", port=<%= portFlask %>, debug=True)
