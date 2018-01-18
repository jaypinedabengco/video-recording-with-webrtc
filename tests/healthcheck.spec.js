const healthcheck = require('./../services/healthcheck.service');
const chai = require('chai'), 
      chaiAsPromised = require('chai-as-promised');

//setup chai
chai.use(chaiAsPromised);
const expect = chai.expect;
      

describe('healthcheck service', () => {
  describe('"checkHealth"', () => {

    it('should be a function', () => {
      expect(healthcheck.checkHealth).to.be.a('Function');
    });

    let healthcheck_result = healthcheck.checkHealth();

    it('should return a Promise', () => {
      expect(healthcheck_result.then).to.be.a('Function');
      expect(healthcheck_result.catch).to.be.a('Function');      
    });
    
    it('should have no error', () => {
      return healthcheck_result
        .then(() => expect(true).to.be.true)
        .catch((err) => expect(false, err).to.be.true);
    });

    it('should have value of "1" to redis.status', () => {
      return healthcheck_result.then((health) => expect(health.redis.status).to.equal(1));
    });    

    it('should have value of "1" to db.status', () => {
      return healthcheck_result.then((health) => expect(health.db.status).to.equal(1));
    });     

  });

});