import os
from flask import Flask, url_for, render_template, g, request, current_app
import controller, view

app = Flask(__name__)

with app.app_context():
    current_app.local_paths = {
        "db_config" : os.path.dirname(os.path.realpath(__file__)) + "/config/my.conf",
    }


@app.route('/')
def homepage():
    return render_template("home.html")

@app.route('/hireme/')
def hireme():
    return render_template("hireme.html")

@app.route('/hireme/q-and-a/', methods=["POST", "GET"])
def q_and_a():

    if (request.method == "POST"):
        if controller.add_answer(request) is True:
            return render_template("success.html", q_num=view.get_next_qid(request))
        else:
            return render_template("404.html")

    elif (request.method == "GET"):
        context = view.get_question(request)
        return render_template("question.html", context=context)

@app.route('/static/')
def static_files():
    url_for('static', filename='css/home.css')
    url_for('static', filename='js/homepage.js')
    url_for('static', filename='css/hireme.css')
    url_for('static', filename='js/hireme.js')
