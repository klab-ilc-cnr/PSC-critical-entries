# queryPSC
queryPSC is a simple PHP front end to query PSC lexicon stored in a MySQL server.
# Autore
* [Simone Marchi](https://www.ilc.cnr.it/en/people/simone-marchi/) -- simone.marchi[at]ilc.cnr.it -- *tecnologo@CNR-ILC* 
## Requirements
* Apache
* PHP (mod-php version >= 7.4)
* MySQL server (>=5.6)

## Installation
1. download the PSC lexicon from Clarin-IT repository [Download](https://dspace-clarin-it.ilc.cnr.it/repository/xmlui/bitstream/handle/20.500.11752/ILC-88/simplelexicon.sql.tar.gz?sequence=1&isAllowed=y)
2. load the lexicon dump into the MySQL database:
```
gunzip simplelexicon.dump.gz | mysql -u USER -p < simplelexicon.dump
```
3. clone this repository in the Apache root directory (/var/www/html/ in Ubuntu)
4. rename the configDB.php.stub in configDB.php and customize it in order to point the MySQL server with the correct hostname, username and password
5. you should have to activate apache php module (```sudo a2enmod php8.1```) (the php module version varies with the distribution)
6. reload Apache webserver to load the php module (```sudo systemctl reload apache2```)
7. point the browser to http://localhost/queryPSC
