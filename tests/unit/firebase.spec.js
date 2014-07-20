'use strict';
describe('$firebase', function () {

  var $firebase, $timeout, $fb, $rootScope;

  beforeEach(function() {
    module('mock.firebase');
    module('firebase');
    inject(function (_$firebase_, _$timeout_, _$rootScope_) {
      $firebase = _$firebase_;
      $timeout = _$timeout_;
      $rootScope = _$rootScope_;
      $fb = new $firebase(new Firebase('Mock://'));
      flushAll();
    });
  });

  describe('<constructor>', function() {
    it('should accept a Firebase ref', function() {
      var ref = new Firebase('Mock://');
      var $fb = new $firebase(ref);
      expect($fb.$ref()).toBe(ref);
    });

    it('should throw an error if passed a string', function() {
      expect(function() {
        $firebase('hello world');
      }).toThrowError(/valid Firebase reference/);
    });
  });

  describe('$ref', function() {
    it('should return ref that created the $firebase instance', function() {
      var ref = new Firebase('Mock://');
      var $fb = new $firebase(ref);
      expect($fb.$ref()).toBe(ref);
    });
  });

  describe('$push', function() {
    it('should return a promise', function() {
      var res = $fb.$push({foo: 'bar'});
      expect(angular.isObject(res)).toBe(true);
      expect(typeof res.then).toBe('function');
    });

    it('should resolve to the ref for new id', function() {
      var whiteSpy = jasmine.createSpy('resolve');
      var blackSpy = jasmine.createSpy('reject');
      $fb.$push({foo: 'bar'}).then(whiteSpy, blackSpy);
      flushAll();
      var newId = $fb.$ref().getLastAutoId();
      expect(whiteSpy).toHaveBeenCalled();
      expect(blackSpy).not.toHaveBeenCalled();
      var ref = whiteSpy.calls.argsFor(0)[0];
      expect(ref.name()).toBe(newId);
    });

    it('should reject if fails', function() {
      var whiteSpy = jasmine.createSpy('resolve');
      var blackSpy = jasmine.createSpy('reject');
      $fb.$ref().failNext('push', 'failpush');
      $fb.$push({foo: 'bar'}).then(whiteSpy, blackSpy);
      flushAll();
      expect(whiteSpy).not.toHaveBeenCalled();
      expect(blackSpy).toHaveBeenCalledWith('failpush');
    });

    it('should save correct data into Firebase', function() {
      var id;
      var spy = jasmine.createSpy('push callback').and.callFake(function(ref) {
        id = ref.name();
      });
      $fb.$push({foo: 'pushtest'}).then(spy);
      flushAll();
      expect(spy).toHaveBeenCalled();
      expect($fb.$ref().getData()[id]).toEqual({foo: 'pushtest'});
    });

    it('should work on a query'); //todo-test
  });

  describe('$set', function() {
    it('should return a promise', function() {
      var res = $fb.$set(null);
      expect(angular.isObject(res)).toBe(true);
      expect(typeof res.then).toBe('function');
    });

    it('should resolve to ref for child key', function() {
      var whiteSpy = jasmine.createSpy('resolve');
      var blackSpy = jasmine.createSpy('reject');
      $fb.$set('reftest', {foo: 'bar'}).then(whiteSpy, blackSpy);
      flushAll();
      expect(whiteSpy).toHaveBeenCalled();
      expect(blackSpy).not.toHaveBeenCalled();
      var ref = whiteSpy.calls.argsFor(0)[0];
      expect(ref).toBe($fb.$ref().child('reftest'));
    });

    it('should resolve to ref if no key', function() {
      var whiteSpy = jasmine.createSpy('resolve');
      var blackSpy = jasmine.createSpy('reject');
      $fb.$set({foo: 'bar'}).then(whiteSpy, blackSpy);
      flushAll();
      expect(whiteSpy).toHaveBeenCalled();
      expect(blackSpy).not.toHaveBeenCalled();
      var ref = whiteSpy.calls.argsFor(0)[0];
      expect(ref).toBe($fb.$ref());
    });

    it('should save a child if key used', function() {
      $fb.$set('foo', 'bar');
      flushAll();
      expect($fb.$ref().getData()['foo']).toEqual('bar');
    });

    it('should save everything if no key', function() {
      $fb.$set(true);
      flushAll();
      expect($fb.$ref().getData()).toBe(true);
    });

    it('should reject if fails', function() {
      $fb.$ref().failNext('set', 'setfail');
      var whiteSpy = jasmine.createSpy('resolve');
      var blackSpy = jasmine.createSpy('reject');
      $fb.$set({foo: 'bar'}).then(whiteSpy, blackSpy);
      flushAll();
      expect(whiteSpy).not.toHaveBeenCalled();
      expect(blackSpy).toHaveBeenCalledWith('setfail');
    });

    it('should affect query keys only if query used'); //todo-test
  });

  describe('$remove', function() {
    it('should return a promise', function() {
      var res = $fb.$remove();
      expect(angular.isObject(res)).toBe(true);
      expect(typeof res.then).toBe('function');
    });

    it('should resolve to ref if no key', function() {
      var whiteSpy = jasmine.createSpy('resolve');
      var blackSpy = jasmine.createSpy('reject');
      $fb.$remove().then(whiteSpy, blackSpy);
      flushAll();
      expect(whiteSpy).toHaveBeenCalled();
      expect(blackSpy).not.toHaveBeenCalled();
      var ref = whiteSpy.calls.argsFor(0)[0];
      expect(ref).toBe($fb.$ref());
    });

    it('should resolve to child ref if key', function() {
      var whiteSpy = jasmine.createSpy('resolve');
      var blackSpy = jasmine.createSpy('reject');
      $fb.$remove('b').then(whiteSpy, blackSpy);
      flushAll();
      expect(whiteSpy).toHaveBeenCalled();
      expect(blackSpy).not.toHaveBeenCalled();
      var ref = whiteSpy.calls.argsFor(0)[0];
      expect(ref).toBe($fb.$ref().child('b'));
    });

    it('should remove a child if key used', function() {
      $fb.$remove('c');
      flushAll();
      var dat = $fb.$ref().getData();
      expect(angular.isObject(dat)).toBe(true);
      expect(dat.hasOwnProperty('c')).toBe(false);
    });

    it('should remove everything if no key', function() {
      $fb.$remove();
      flushAll();
      expect($fb.$ref().getData()).toBe(null);
    });

    it('should reject if fails'); //todo-test

    it('should remove data in Firebase'); //todo-test

    it('should only remove keys in query if used on a query'); //todo-test
  });

  describe('$update', function() {
    it('should return a promise', function() {
      expect($fb.$update({foo: 'bar'})).toBeAPromise();
    });

    it('should resolve to ref when done', function() { //todo-test
      var spy = jasmine.createSpy('resolve');
      $fb.$update('index', {foo: 'bar'}).then(spy);
      flushAll();
      var arg = spy.calls.argsFor(0)[0];
      expect(arg).toBeAn('object');
      expect(arg.name).toBeA('function');
      expect(arg.name()).toBe('index');
    });

    it('should reject if failed', function() {
      var whiteSpy = jasmine.createSpy('resolve');
      var blackSpy = jasmine.createSpy('reject');
      $fb.$ref().failNext('update', 'oops');
      $fb.$update({index: {foo: 'bar'}}).then(whiteSpy, blackSpy);
      flushAll();
      expect(whiteSpy).not.toHaveBeenCalled();
      expect(blackSpy).toHaveBeenCalled();
    });

    it('should not destroy untouched keys', function() {
      var $fbChild = new $firebase($fb.$ref().child('data'));
      flushAll();
      var data = $fbChild.$ref().getData();
      data.a = 'foo';
      delete data.b;
      expect(Object.keys(data).length).toBeGreaterThan(1);
      $fbChild.$update({a: 'foo', b: null});
      flushAll();
      expect($fbChild.$ref().getData()).toEqual(data);
    });

    it('should replace keys specified', function() {
      $fb.$update({a: 'foo', b: null});
      flushAll();
      var data = $fb.$ref().getData();
      expect(data.a).toBe('foo');
      expect(data.b).toBe(null);
    });

    it('should work on a query object', function() { //todo-test
      var $fb2 = $firebase($fb.$ref().child('data').limit(1));
      flushAll();
      $fb2.$update({foo: 'bar'});
      flushAll();
      expect($fb2.$ref().ref().getData().foo).toBe('bar');
    });
  });

  describe('$transaction', function() {
    it('should return a promise'); //todo-test

    it('should resolve to snapshot on success'); //todo-test

    it('should resolve to undefined on abort'); //todo-test

    it('should reject if failed'); //todo-test

    it('should modify data in firebase'); //todo-test

    it('should work okay on a query'); //todo-test
  });

  describe('$toArray', function() {
    it('should return an array'); //todo-test

    it('should contain data in ref() after load'); //todo-test

    it('should return same instance if called multiple times'); //todo-test

    it('should use arrayFactory'); //todo-test

    it('should use recordFactory'); //todo-test

    it('should only contain query nodes if query used'); //todo-test
  });

  describe('$toObject', function() {
    it('should return an instance of $FirebaseObject'); //todo-test

    it('should contain data in ref() after load'); //todo-test

    it('should return same instance if called multiple times'); //todo-test

    it('should use recordFactory'); //todo-test

    it('should only contain query keys if query used'); //todo-test
  });

  describe('query support', function() {
    it('should create array of correct length with limit'); //todo-test

    it('should return the query object in ref'); //todo-test
  });

  function deepCopy(arr) {
    var newCopy = arr.slice();
    angular.forEach(arr, function(obj, k)  {
      newCopy[k] = angular.extend({}, obj);
    });
    return newCopy;
  }

  var flushAll = (function() {
    return function flushAll() {
      // the order of these flush events is significant
      $fb.$ref().flush();
      Array.prototype.slice.call(arguments, 0).forEach(function(o) {
        o.flush();
      });
      try { $timeout.flush(); }
      catch(e) {}
    }
  })();
});