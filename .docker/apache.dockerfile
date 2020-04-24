FROM httpd:2.4

RUN apt update -y
COPY .docker/conf/apache.conf /usr/local/apache2/conf/demoapache.conf
RUN echo "\nInclude /usr/local/apache2/conf/demoapache.conf" >> /usr/local/apache2/conf/httpd.conf
