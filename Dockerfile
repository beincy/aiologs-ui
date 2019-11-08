FROM  node:latest

RUN /bin/cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo 'Asia/Shanghai' >/etc/timezone 
WORKDIR /usr/src/app
RUN git clone https://github.com/beincy/aiologs-ui.git
COPY  . /usr/src/app
RUN cp -f -r /usr/src/app/deploy/qa/serverconf.js /usr/src/app/
RUN yarn install
ENV NODE_ENV production
EXPOSE 3000
ENTRYPOINT ["/bin/sh", "Hello"]  
CMD ["yarn", "start"]
