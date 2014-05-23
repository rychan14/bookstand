from bs4 import BeautifulSoup
from string import ascii_lowercase
import requests
import platform
import itertools
import json
def is_python_3():
    major, _, _ = platform.python_version_tuple()
    return major == '3'

assert(is_python_3)

def get_html(url):
    return requests.get(url).text

def extract_depts(parsed_html):
    try:
        rows = parsed_html.find(id="subjects_DataList").find_all("tr")
    except AttributeError:
        # print("Could not parse rows from %s" % parsed_html)
        rows = []
    inner_content = [r.find('a').string for r in rows]
    return [c.split("-")[0].strip() for c in inner_content]

def get_start_with_letter(l):
    url  = "http://courses.ucsd.edu/default.aspx?u_letter=%s" % l
    html = get_html(url)
    return extract_depts(BeautifulSoup(html))

def main():
    depts     = [get_start_with_letter(letter) for letter in ascii_lowercase]
    flattened = list(itertools.chain(*depts))
    print(json.dumps({'depts':flattened}))

if __name__ == '__main__':
    main()
