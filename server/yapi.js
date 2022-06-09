const path = require('path');
const fs = require('fs-extra');
const nodemailer = require('nodemailer');
const config = require('../../config.js');

let insts = new Map();
let mail;

const WEBROOT = path.resolve(__dirname, '..'); //路径
const WEBROOT_SERVER = __dirname;
const WEBROOT_RUNTIME = path.resolve(__dirname, '../..');
const WEBROOT_LOG = path.join(WEBROOT_RUNTIME, 'log');
const configs = config.yapiConfig;

fs.ensureDirSync(WEBROOT_LOG);

if (configs.mail && configs.mail.enable) {
    mail = nodemailer.createTransport(configs.mail);
}

/**
 * 获取一个model实例，如果不存在则创建一个新的返回
 * @param {*} m class
 * @example
 * yapi.getInst(groupModel, arg1, arg2)
 */
function getInst(m, ...args) {
    if (!insts.get(m)) {
        insts.set(m, new m(args));
    }
    return insts.get(m);
}

function delInst(m) {
    try {
        insts.delete(m);
    } catch (err) {
        console.error(err); // eslint-disable-line
    }
}


let r = {
    db: {},
    mongoClient: {},
    fs: fs,
    path: path,
    WEBROOT: WEBROOT,
    WEBROOT_SERVER: WEBROOT_SERVER,
    WEBROOT_RUNTIME: WEBROOT_RUNTIME,
    WEBROOT_LOG: WEBROOT_LOG,
    configs: configs,
    getInst: getInst,
    delInst: delInst,
    getInsts: insts
};
if (mail) r.mail = mail;
module.exports = r;