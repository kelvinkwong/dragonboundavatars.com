#!/usr/bin/env python3

import logging
import operator

import requests
import lxml.html
from lxml import etree
import json
from pathlib import Path

CACHE = 'cache'

def download(url, save=False, filename='tmp.html', cookies=None):
    logging.debug('enter download')
    if not Path(CACHE).is_dir():
        Path(CACHE).mkdir()

    if Path(CACHE).joinpath(filename).is_file():
        content = None
        with open(Path(CACHE).joinpath(filename), 'rb') as f:
            content = f.read()
        return content

    logging.debug(f'downloading - {filename} - {url}')
    r = requests.get(url, cookies=cookies)
    if r.ok:
        if save:
            with open(Path(CACHE).joinpath(filename), 'wb') as f:
                f.write(r.content)
        return r.content

def get_document(url):
    filename = Path(url).name
    content = download(url, save=True, filename=filename)

    return lxml.html.fromstring(content)

def get_document_from_file(path):
    content = None
    with open(path, 'r') as f:
        content = f.read()
    return lxml.html.fromstring(content)

def get_avatars(url, currencies_allowed, sum_attributes, order_by_attribute):
    headers = []
    avatars = []

    document = get_document(url)

    for position, header in enumerate(document.xpath('//thead//th')):
        logging.debug(f'{position} - {header.text}')
        if position != 0 and header.text != '':
            headers.append(header.text)

    for row in document.xpath('//tbody//tr'):
        avatar = {}
        for position, attribute in enumerate(row.xpath('.//td')):
            logging.debug(f'{headers[position]} - {attribute.text}')
            avatar[headers[position]] = attribute.text
            if attribute.text.isnumeric():
                avatar[headers[position]] = int(attribute.text)
        avatars.append(avatar)

    if currencies_allowed:
        avatars = filter_by_currency(avatars, currencies_allowed)
    if sum_attributes:
        avatars = add_attribute_sum(avatars, sum_attributes)
    if order_by_attribute:
        avatars = get_order_by_attribute(avatars, order_by_attribute)
    return avatars

def filter_by_currency(avatars, currencies_allowed):
    if 'cash' in currencies_allowed and 'gold' in currencies_allowed:
        return avatars
    else:
        return [avatar for avatar in avatars if avatar[f'{currencies_allowed[0]} price'] != 0]

def add_attribute_sum(avatars, sum_attributes):
    for avatar in avatars:
        filter_by_attributes = [avatar[attribute] for attribute in sum_attributes]
        avatar['summed_attributes'] = sum(filter_by_attributes)
    return avatars

def get_order_by_attribute(avatars, order_by_attribute):
    # https://pythonhow.com/how/sort-a-list-of-dictionaries-by-a-value-of-the-dictionary/
    # https://stackoverflow.com/a/73050/14689102
    # return sorted(avatars, key=lambda x: x[order_by_attribute])
    return sorted(avatars, key=operator.itemgetter(order_by_attribute))

def main():
    hats = 'http://dragonboundavatars.com/hats.html'
    body = 'http://dragonboundavatars.com/body.html'
    flags = "http://dragonboundavatars.com/flags.html"
    glasses = 'http://dragonboundavatars.com/glasses.html'

    equipment = glasses
    # currencies_allowed = ['cash', 'gold']
    currencies_allowed = ['gold']
    sum_attributes = ['defense', 'HP']
    # sum_attributes = ['attack', 'defense', 'HP']
    sum_attributes = ['popularity', 'attack', 'defense', 'HP']
    # sum_attributes = ['popularity', 'speed', 'attack', 'defense', 'HP', 'dig']
    order_by_attribute = 'summed_attributes'

    avatars = get_avatars(equipment, currencies_allowed, sum_attributes, order_by_attribute)
    logging.info(f'found: {len(avatars)}')
    print(json.dumps(avatars))


if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG, format='%(asctime)s %(levelname)s %(filename)s +%(lineno)d - %(message)s')
    main()
