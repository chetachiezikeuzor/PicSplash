import superagent from "superagent";

export const simpleGet = (options) => {
  superagent
    .get(options.url)
    .then(function (res) {
      if (options.onSuccess) options.onSuccess(res);
    })
    .catch(function (err) {
      if (options.onAbort) options.onAbort(err);
    });
};
