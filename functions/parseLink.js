exports.handler = function (event, context, callback) {
    if (event.httpMethod !== "POST" || !event.body) {
        return callback(null, {
            statusCode: 400,
            body: "METHOD NOT ALLOWED"
        });
    }
    const html = `<html><head>__META_TAG__</head><style>body{user-select:all;}</style><body>__CONTENT__</body></html>`;
    const metaTag = `<meta http-equiv="refresh" content="0; url=__URL__" />`;
    const [, urlParam, typeOfRequest] = event.body.match(/^url\=(.*?)&(.*)\=$/);
    const regex = new RegExp(/magnet.*/);
    let response = "Invalid URL";
    if (urlParam.match(regex)) {
        const url = decodeURIComponent(decodeURIComponent(urlParam.match(regex)[0]));
        if (typeOfRequest === "goToURL") response = html.replace("__META_TAG__", metaTag).replace("__URL__", url).replace("__CONTENT__", "");
        else response = html.replace("__META_TAG__", "").replace("__CONTENT__", url);
    }
    return callback(null, {
        statusCode: 200,
        body: response
    });
}