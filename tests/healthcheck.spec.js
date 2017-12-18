const healthcheck = require('./../services/healthcheck.service');
const chai = require('chai'), 
      chaiAsPromised = require('chai-as-promised');
x
//setup chai
chai.use(chaiAsPromised);
const expect = chai.expect;
      

describe('healthcheck service', () => {
  describe('"checkHealth"', () => {

    it('should be a function', () => {
      expect(healthcheck.checkHealth).to.be.a('Function');
    });

    it('should return a Promise', () => {
      const healthcheck_result = healthcheck.checkHealth();
      expect(healthcheck_result.then).to.be.a('Function');
      expect(healthcheck_result.catch).to.be.a('Function');      
    });
    
    it('should have no error', () => {
      return healthcheck.checkHealth()
        .then(() => expect(true).to.be.false)
        .catch((err) => expect(false, err).to.be.true);
    });

    it('should have value of "1" to redis.status', () => {
      return healthcheck.checkHealth().then((health) => expect(health.redis.status).to.equal(1));
    });    

  });

});