from os.path import isfile
from glob import glob
import platform
import re
import json

def is_python_3():
    major, _, _ = platform.python_version_tuple()
    return major == '3'
assert(is_python_3)


def main():
    # pylint: disable=C0103
    filenames = [f for f in glob("train/*.message") if not isfile(f + ".ref")]
    for filename in filenames:
        message = open(filename).read()
        print("Message: %s\n---------\n\n%s\n---------\n" % (filename, message))

        is_post = get_valid_input("Is actually a post (y/n): ", parse_yn)
        if is_post:
            num_books = get_valid_input("How many books buying / selling: ", parse_positive_int)
            books = [get_book_data(i) for i in range(num_books)]
        else:
            books = []
        write_ref_file(books, filename  + '.ref')

def get_book_data(i):
    print("\nEnter data for book %s:" % (i+1))
    book = {}
    book['buysell']       = get_valid_input("[b]uy or [s]ell: ", parse_buysell)
    book['title']         = input("Book Title (blank for none): ") or None
    book['author']        = input("Book Author (blank for none): ") or None
    book['isbn']          = get_valid_input("Book ISBN (blank for none): ", parse_maybe_isbn)
    book['course_name']   = input("Course Name (blank for none): ") or None
    book['course_number'] = input("Course Number (blank for none): ") or None
    book['price']         = get_valid_input("Price: (blank for none): ", parse_maybe_price)
    return book

def write_ref_file(books, filename):
    to_write = json.dumps(books, sort_keys=True, indent=4, separators=(',', ': '))
    open(filename, 'w').write(to_write)
    print("Wrote output to %s\n\n" % filename)

def get_valid_input(prompt, parse):
    response = input(prompt)
    parsed, valid = parse(response)
    if valid:
        return parsed
    else:
        print("I couldn't understand %s" % response)
        return get_valid_input(prompt, parse)

def parse_yn(resp):
    r = resp.lower()
    if r == 'n' or r == 'no':
        return False, True
    elif r == 'y' or r == 'yes':
        return True, True
    else:
        return None, False

def parse_buysell(resp):
    r = resp.lower()
    if r == 'b' or r == 'buy':
        return 'buy', True
    elif r == 's' or r == 'sell':
        return "sell", True
    else:
        return None, False

def parse_positive_int(resp):
    try:
        i = int(resp)
        if i > 0:
            return i, True
        else:
            return None, False
    except ValueError:
        return None, False

def parse_maybe_isbn(resp):
    if not resp:
        return None, True
    isbn_regex = r'[0-9\-]*'
    if re.match(isbn_regex, resp):
        return resp, True
    else:
        return None, False

def parse_maybe_price(resp):
    if not resp:
        return None, True
    try:
        i = float(resp)
        if i > 0:
            return i, True
        else:
            return None, False
    except ValueError:
        return None, False
    
if __name__ == '__main__':
    main()
