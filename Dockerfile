FROM  node:latest

RUN /bin/cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo 'Asia/Shanghai' >/etc/timezone 
WORKDIR /usr/src/app
RUN git clone https://github.com/beincy/aiologs-ui.git
WORKDIR /usr/src/app/aiologs-ui
RUN yarn install
ENV NODE_ENV production
EXPOSE 3000
CMD ["yarn", "start"]
