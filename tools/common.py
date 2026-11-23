import os,pathlib
ROOT=pathlib.Path(__file__).resolve().parent.parent
def url(path='index.html'):return (ROOT/path).as_uri()
