import os
from flask import Flask, request, session, render_template, jsonify, redirect, url_for

app = Flask(__name__, static_folder='static', static_url_path='')

@app.route("/")
def game():
	return render_template('game.html')

@app.route("/configure")
def configure():
	return render_template('configure.html')

if __name__ == "__main__":
	app.debug = True
	app.run()
