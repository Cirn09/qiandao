#!/usr/bin/env python
# -*- encoding: utf-8 -*-
# vim: set et sw=4 ts=4 sts=4 ff=unix fenc=utf8:
# Author: Binux<i@binux.me>
#         http://binux.me
# Created on 2014-08-08 21:06:02

from .base import *
from . import api


class AboutHandler(BaseHandler):
    @tornado.web.addslash
    async def get(self):
        await self.render('about.html', apis=api.apis, repr=repr)
        return

handlers = [
        ('/about/?', AboutHandler),
        ]
