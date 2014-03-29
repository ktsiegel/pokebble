from flask import Flask, request, session, render_template, jsonify, redirect, url_for
from flask import render_template
from flask import url_for
app = Flask(__name__, static_folder='static', static_url_path='')

@app.route("/")
def game():
	return "hello world"

if __name__ == "__main__":
	app.debug = True
	app.run()
