exports.handler = function (event, context, callback) {
    let html = `<!DOCTYPE html><html lang="en"><head><meta http-equiv="refresh" content="0; url=__URL__" /></head></html>`;
    if (event.httpMethod !== "POST" || !event.body) {
        return callback(null, {
            statusCode: 400,
            body: "METHOD NOT ALLOWED"
        });
    }
    let urlParam = event.body.match(/^url\=(.*)$/)[1];
    const regex = new RegExp(/magnet.*/);
    urlParam = urlParam.match(regex) ? decodeURIComponent(urlParam.match(regex)[0]) : null;
    if (urlParam) {
        html = html.replace("__URL__", urlParam);
        return callback(null, {
            statusCode: 200,
            body: html
        });
    }
    return callback(null, {
        statusCode: 200,
        body: "Invalid URL"
    });
}