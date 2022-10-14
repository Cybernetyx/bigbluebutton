
# FAQ
## How to change css of BBB audio/video conferencing page
- create a css file
- add all changes to the file
- upload and host the file in some file hosting service (e.g s3)
- add the css file url to the bigbluebutton-html5/private/config/settings.yml

##### e.g:
```
customStyleUrl: https://brightclass-library.s3.ap-south-1.amazonaws.com/main.css
```

## How to deploy using the local deploy method:
copy/download bigbluebutton-html5 from this repository to the server
```
~/dev/bigbluebutton/bigbluebutton-html5
```

copy/download the build directory from this repository to the server
```
~/dev/bigbluebutton/build
```

## How to deploy in production:

1. clone the repo
2. install meteor
3. set to 2.5 version
3. build the bigbluebutton-html5
4. replace the build bundle in /usr/share/meteor/bundle with the generated bundle

e.g
```
BUILD_SERVER_DIR=/home/ubuntu/dev
PROJECT_DIR=$BUILD_SERVER_DIR/custom-bigbluebutton/v2.4.4
BBB_HTML5_DIR=$PROJECT_DIR=$PROJECT_DIR/bigbluebutton-html5
BUNDLE_DESTINATION=/usr/share/meteor

cd $BUILD_SERVER_DIR
git clone git@github.com:Cybernetyx/custom-bigbluebutton.git

cd $BBB_HTML5_DIR
curl https://install.meteor.com/ | sh
meteor update --allow-superuser --release 2.5
meteor build --server-only $BBB_HTML5_DIR/meteorbundle
sudo tar -xzvf $BBB_HTML5_DIR/meteorbundle/*.tar.gz -C $BUNDLE_DESTINATION

sudo chown -R meteor:meteor $BUNDLE_DESTINATION
sudo bbb-conf --restart
```


### Note:
The path of the bigbluebutton-html5 and build should be as give above, else the deploy_to_usr_share.sh will not work

```
cd ~/dev/bigbluebutton/bigbluebutton-html5
./deploy_to_usr_share.sh
```

## How to change the favicon.ico of the `Recordings Playback` page
replace the file at the following location
`/var/bigbluebutton/playback/presentation/2.3/favicon.ico`

reference:
https://higheredlab.com/bigbluebutton-put-your-logo-in-recordings-tips/

## How to change the default slides in presentation
replace file at the following location.
`/var/www/bigbluebutton-default/default.pdf`

## How to add a default slide for a particular meeting
reference:
https://docs.bigbluebutton.org/dev/api.html#pre-upload-slides



## Deployment Notes:
- make sure the the version of BigBlueButton using the script is for version 2.4.4 bbb-install.sh.
```
# command to install v2.4.4 of BigBlueButton
wget -qO- https://ubuntu.bigbluebutton.org/bbb-install.sh | bash -s -- -v bionic-240-2.4.4 -s test5.brightclass.com -e support@brightclass.com -a -w
```
- version mismatch with the install BigBlueButton might lead to non functioning of our custom bigbluebutton.
- since our custom bigbluebutton is based on v2.4.4 from the official BigBlueButton.



# Troubleshooting:
## Unable to share webcam / 1020 errors (media unable to reach server).
check if wsUrl if properly configured in the settings.yml of the deployed BBB server

https://docs.bigbluebutton.org/support/troubleshooting.html#unable-to-share-webcam