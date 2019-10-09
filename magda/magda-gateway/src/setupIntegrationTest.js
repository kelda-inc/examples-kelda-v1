const updatedInTest = "before code change";

module.exports = function(app, id) {
  app.get(`/integration-test-${id}`, function (req, res) {
    res.send(updatedInTest);
  });
};
