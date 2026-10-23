import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync('public/push/onesignal/OneSignalSDKWorker.js','utf8');
function worker(subscription){
 const handlers={},calls=[];
 vm.runInNewContext(source,{
  self:{addEventListener:(name,handler)=>{handlers[name]=handler;},skipWaiting:async()=>{calls.push('skipWaiting');},registration:{pushManager:{getSubscription:async()=>subscription},unregister:async()=>{calls.push('unregister');return true;}}},
  importScripts:()=>{throw Error('Retired worker must not contact a vendor');},
 });
 return {calls,run(name){let pending;handlers[name]({waitUntil:p=>{pending=p;}});return pending;}};
}
test('dawny worker wypisuje subskrypcję przed wyrejestrowaniem',async()=>{
 const w=worker({unsubscribe:async()=>{w.calls.push('unsubscribe');return true;}});
 await w.run('install');await w.run('activate');
 assert.deepEqual(w.calls,['skipWaiting','unsubscribe','unregister']);
});
test('błąd wypisania nie wyrejestrowuje workera przed zakończeniem czyszczenia',async()=>{
 const w=worker({unsubscribe:async()=>false});
 await assert.rejects(w.run('activate'));
 assert.deepEqual(w.calls,[]);
});
test('już wypisane urządzenie może usunąć pustą rejestrację',async()=>{
 const w=worker(null);await w.run('activate');assert.deepEqual(w.calls,['unregister']);
});
