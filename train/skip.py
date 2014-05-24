from os.path import isfile
from glob import glob
import platform
import os

def is_python_3():
    major, _, _ = platform.python_version_tuple()
    return major == '3'

assert(is_python_3)


def main():
    # pylint: disable=C0103
    noskip = [line.strip() for line in open('noskip').readlines()]
    def should_prompt(filename):
        return not filename.startswith('skip') and\
               isfile(filename + '.ref') and\
               filename not in noskip

    filenames = [f for f in glob("*.message") if should_prompt(f)]
    for filename in filenames:
        message = open(filename).read()
        ref = open(filename + ".ref").read()
        print("Message: %s\n---------\n\n%s\n---------\n" % (filename, message))
        print("Ref: %s\n", ref)

        should_skip = get_valid_input("Skip (y/n): ", parse_yn)
        if should_skip:
            os.rename(filename,'skip.%s' % filename)
            os.rename(filename + '.ref','skip.%s.ref' % filename)
            with open('skip', 'a') as f:
                f.write(filename + '\n')
        else:
            with open('noskip', 'a') as f:
                f.write(filename + '\n')


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

if __name__ == '__main__':
    main()
