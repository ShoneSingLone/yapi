const fs = require('fs-extra');
const yapi = require('./yapi.js');
const commons = require('./utils/commons');
const { asyncInitDBConnect } = require('./utils/db.js');

yapi.commons = commons;

async function install() {
  await asyncInitDBConnect(yapi);
  let exist = yapi.commons.fileExist(yapi.path.join(yapi.WEBROOT_RUNTIME, 'init.lock'));
  if (exist) {
    throw new Error(
      'init.lock文件已存在，请确认您是否已安装。如果需要重新安装，请删掉init.lock文件'
    );
  } else {
    initAdmin();
  }
}

async function initAdmin() {
  let passsalt = yapi.commons.randStr();
  try {

    await yapi.db.collection("user").insertOne({
      username: yapi.configs.adminAccount.substr(0, yapi.configs.adminAccount.indexOf('@')),
      email: yapi.configs.adminAccount,
      password: yapi.commons.generatePassword(yapi.configs.adminPwd, passsalt),
      passsalt: passsalt,
      role: 'admin',
      add_time: yapi.commons.time(),
      up_time: yapi.commons.time()
    });

    let userCol = yapi.db.collection('user');
    await userCol.createIndex({ username: 1 });
    await userCol.createIndex( { email: 1 }, { unique: true } );

    let projectCol = yapi.db.collection('project');
    await projectCol.createIndex({ uid: 1 });
    await projectCol.createIndex({ name: 1 });
    await projectCol.createIndex({ group_id: 1 });

    let logCol = yapi.db.collection('log');
    await logCol.createIndex({ uid: 1 });

    await logCol.createIndex({ typeid: 1, type: 1 });

    let interfaceColCol = yapi.db.collection('interface_col');
    await interfaceColCol.createIndex({ uid: 1 });
    await interfaceColCol.createIndex({ project_id: 1 });

    let interfaceCatCol = yapi.db.collection('interface_cat');
    await interfaceCatCol.createIndex({ uid: 1 });
    await interfaceCatCol.createIndex({ project_id: 1 });

    let interfaceCaseCol = yapi.db.collection('interface_case');
    await interfaceCaseCol.createIndex({ uid: 1 });
    await interfaceCaseCol.createIndex({ col_id: 1 });
    await interfaceCaseCol.createIndex({ project_id: 1 });

    let interfaceCol = yapi.db.collection('interface');
    await interfaceCol.createIndex({ uid: 1 });
    await interfaceCol.createIndex({ path: 1, method: 1 });
    await interfaceCol.createIndex({ project_id: 1 });

    let groupCol = yapi.db.collection('group');
    await groupCol.createIndex({ uid: 1 });
    await groupCol.createIndex({ group_name: 1 });

    let avatarCol = yapi.db.collection('avatar');
    await avatarCol.createIndex({ uid: 1 });

    let tokenCol = yapi.db.collection('token');
    await tokenCol.createIndex({ project_id: 1 });

    let followCol = yapi.db.collection('follow');
    await followCol.createIndex({ uid: 1 });
    await followCol.createIndex({ project_id: 1 });


    fs.ensureFileSync(yapi.path.join(yapi.WEBROOT_RUNTIME, 'init.lock'));
    console.log(
      `初始化管理员账号成功,账号名："${yapi.configs.adminAccount}"，密码："${yapi.configs.adminPwd}"`
    ); // eslint-disable-line
    process.exit(0);
  } catch (error) {
    console.log(`初始化管理员账号 "${yapi.configs.adminAccount}" 失败`); // eslint-disable-line
    console.log(error);
  }
}

install();
