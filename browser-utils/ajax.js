/**
 * 非同步 ajax Api 請求.
 *
 * @param {Object} options - ajax options.
 * @param {string} options.method - HTTP method to use for the request (e.g., "GET", "POST").
 * @param {string} options.url - Request Url.
 * @param {Object} [options.params] - Request body.
 * @param {boolean} [options.cache=false] - 是否緩存.
 * @returns {Promise}
 */
export async function ajaxApi({ method, url, params, cache = false }) {
  return await $.ajax({
    type: method,
    url: `../api/${url}`,
    contentType: "application/json",
    dataType: "json",
    data: params,
    async: true,
    cache,
  })
}
