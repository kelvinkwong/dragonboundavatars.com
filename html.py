from lxml.html import builder as E
import lxml.html
import logging

class Html():
    def __init__(self, output='docs/index.html'):
        self.html = None
        self.assets = None
        self.output = output
        self.make_html()

    def make_html(self):
        head = E.HEAD(
            E.META(charset='utf-8'),
            E.META(name='viewport', content='width=device-width, initial-scale=1'),

            E.TITLE('Dragonbound.net Avatars'),
            E.LINK(rel="stylesheet", href="./styles/main.css", type="text/css"),
            E.SCRIPT(src='./scripts/util.js'),
            E.SCRIPT(src='./scripts/main.js'),
            E.SCRIPT(src='./scripts/sorttable.js')
        )
        body = E.BODY(
            E.DIV(id='options'),
            E.DIV(id='tables')
        )
        self.html = E.HTML(
            head,
            body,
            lang="en"
        )

    def write_html(self):
        with open(self.output, 'wb') as f:
            # f.write(lxml.html.tostring(html))
            f.write(lxml.html.tostring(self.html, pretty_print=True))


if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG, format='%(asctime)s %(levelname)s %(filename)s +%(lineno)d - %(message)s')
    html = Html()
    html.write_html()
