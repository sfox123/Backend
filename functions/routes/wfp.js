const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const algoliasearch = require("algoliasearch");
var request = require("request");
const { MAX_NUMBER_USER_LABELS } = require("firebase-functions/v1");
const History = mongoose.model("History");
const User = mongoose.model("Wfp");
const FingerPrint = mongoose.model("FingerPrint");

router.post("/wfp/login", async (req, res) => {
  const { userName, passWord } = req.body.userData;
  try {
    if (!userName || !passWord) {
      return res.status(422).send({ error: "Must Provide a Password" });
    }
    const user = await User.findOne({ name: userName });

    if (user.password === passWord) {
      res.send(user);
    } else {
      res.status(422).send({ error: "Invalid Password" });
    }
  } catch (error) {
    res.send(error).status(500);
  }
});

router.post("/wfp/getUser", async (req, res) => {
  const userId = req.body.id;
  try {
    const user = await User.findById(userId);
    res.send(user);
  } catch (error) {
    res.send(error).status(500);
  }
});

router.post("/wfp/getBioMetric", async (req, res) => {
  const { bioMetric, userName, userUnit, list, assignedBy } = req.body;
  const output = getDate();
  let tmpArr = [];
  try {
    list.map((x, i) => {
      x.date = output;
      x.verified = true
      x.assignedBy = assignedBy
      x.pending = true
      x.date = getDate()
      tmpArr.push(x)
    });
    const user = await new FingerPrint({
      name: userName,
      biometric: bioMetric,
      unit: userUnit,
      signature: null,
      items: tmpArr
    }).save();
    res.send("Successfully Saved " + userName + " !").status(200);
  } catch (error) {
    res.send(error).status(422);
  }
});

router.post("/wfp/getMail", async (req, res) => {
  const { name, cat, list, assignedBy } = req.body;
  const output = getDate();
  let tmpArr = [];
  try {
    list.map((x, i) => {
      x.date = output;
      x.verified = false
      x.assignedBy = assignedBy
      x.pending = true
      x.date = getDate()
      tmpArr.push(x)
    });
    const user = await new FingerPrint({
      name,
      unit: cat,
      biometric: null,
      signature: null,
      items: tmpArr
    }).save();
    res.send(user).status(200);
  } catch (error) {
    res.send(error).status(422);
  }
});

router.post("/wfp/getFp", async (req, res) => {
  try {
    const fp = await FingerPrint.find();

    const filtered = fp.filter((item) => {
      return item.biometric != null
    })

    res.send(filtered);
  } catch (error) {
    console.error(error)
  }
});

const getDate = () => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dateObj = new Date();
  const month = monthNames[dateObj.getMonth()];
  const day = String(dateObj.getDate()).padStart(2, "0");
  const year = dateObj.getFullYear();
  const output = day + "\n" + month + "\n" + year;
  return output;
};

router.post("/wfp/postHistory", async (req, res) => {
  const { userId, assignedBy, itemName } = req.body;
  const output = getDate();
  try {

    const fp = await FingerPrint.findOne({ name: userId });

    itemName.map((x, i) => {
      x.date = output;
      x.verified = true
      x.assignedBy = assignedBy
      x.pending = true
      x.date = getDate()
      fp.items.unshift(x);
    });
    await fp.save();
    res.send("Assigned to " + userId);
  } catch (error) {
    console.log(error);
  }
});

router.post("/wfp/postMailOnly", async (req, res) => {
  const { user, assignedBy, list } = req.body;
  const output = getDate();
  try {

    const fp = await FingerPrint.findOne({ name: user });

    list.map((x, i) => {
      x.date = output;
      x.verified = false
      x.assignedBy = assignedBy
      x.pending = true
      x.date = getDate()
      fp.items.unshift(x);
    });
    await fp.save();
    res.send(fp);
  } catch (error) {
    console.log(error);
  }
});
router.post("/wfp/gotItem", async (req, res) => {
  const { moscow } = req.body;
  console.log(row)
  // const fp = await FingerPrint.findById(id);
  // fp.items
  // res.send(fp)
})
router.post("/wfp/getMailUser", async (req, res) => {
  const { id } = req.body;

  try {
    const fp = await FingerPrint.findById(id);
    res.send(fp);

  } catch (error) {
    console.log(error);
  }
});

router.post("/wfp/setImage", async (req, res) => {
  const { id, img } = req.body;

  try {
    const fp = await FingerPrint.findById(id);
    fp.signature = img
    await fp.save()
    res.send("Successfully Saved !!").status(200);
  } catch (error) {
    console.log(error);
  }
});

router.post("/wfp/setImageAndVerify", async (req, res) => {
  const { id, img } = req.body;

  try {
    const fp = await FingerPrint.findById(id);
    fp.signature = img
    fp.items.map((x, i) => {
      if (x.verified === false) {
        x.verified = true;
        fp.items.unshift(x);
        fp.items.splice(i, 1)
      }
    })
    await fp.save()
    res.send("Successfully Saved !!").status(200);
  } catch (error) {
    console.log(error);
  }
});

router.post("/wfp/postVerification", async (req, res) => {
  const { id } = req.body;

  try {
    const fp = await FingerPrint.findById(id);
    fp.items.map(async (x, i) => {
      if (x.verified === false) {
        x.verified = true;
        fp.items.unshift(x);
        fp.items.splice(i, 1)
      }
    })
    await fp.save()
    res.send("Successfully Saved !!").status(200);
  } catch (error) {
    console.log(error);
  }
});

router.get("/wfp/getHistory", async (req, res) => {
  try {
    let history = await FingerPrint.find();
    res.send(history);
  }
  catch (err) {
    console.error(err)
  }
});
router.post("/algolia", async (req, res) => {
  try {
    let history = await FingerPrint.find();

    const searchClient = algoliasearch(
      "O1TFPYIGTD",
      "7e76a71c4fa3ae93e704a40fd6222b7b"
    );

    const index = searchClient.initIndex("searchApp");

    index
      .replaceAllObjects(history, {
        autoGenerateObjectIDIfNotExist: true,
        headers: {
          "X-Forwarded-For": "94.228.178.246",
        },
      })
      .then(({ objectIDs }) => {
        res.send(objectIDs);
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    res.send(error);
  }
});


router.post("/wfp/getStaff", async (req, res) => {
  const { userId } = req.body;

  console.log(userId);
  const fp = await FingerPrint.findById(userId);
  res.send(fp);
});

router.post("/wfp/updateHistory", (req, res) => {
  const { list, author } = req.body;
  let newArr = [];
  let clone = [];
  try {
    list.map(async (x, i) => {
      let foundHistory = await FingerPrint.findById(x._id)
      clone = [...foundHistory.items]
      foundHistory.items.map(async (y, index) => {
        if (y.title === x.title) {
          newArr = [{ ...foundHistory.items[index], ['pending']: false, ['recievedBy']: author, ['recievedDate']: getDate() }]
          clone.splice(index, 1);
        }
        newArr.forEach(element => {
          clone.push(element);
        });
        foundHistory.items = clone
        await foundHistory.save()
      })
    });
    res.send("success").status(200);
  } catch (error) {
    console.error(error);
  }
});

router.get("/wfp/tableNew", async (req, res) => {
  try {
    const FP = await FingerPrint.find();
    let tmpArr = []
    let count = -1;
    FP.map((x, i) => {
      const { items, name ,_id} = x;
      items.map((item, index) => {
        if (item.pending) { 
          tmpArr.push({_id,['id']: ++count,['name']:name,['title']: item.title, ['invNumber']: item.invNumber, ['assignedBy']: item.assignedBy, ['gems']: item.gems, ['verified']: item.verified, ['date']: item.date, ['pending']: item.pending })
        }
      })
    })
    res.send(tmpArr).status(200)
  } catch (error) {
    res.send(error).status(404)
  }
})

router.get("/wfp/tableLegend", async (req, res) => {
  try {
    const FP = await FingerPrint.find();
    let tmpArr = []
    let count = -1;
    FP.map((x, i) => {
      let { items, name ,_id} = x;
      items.map((item, index) => {
        if (!item.pending) {
          tmpArr.push({_id,['id']: ++count,name,['title']: item.title, ['invNumber']: item.invNumber, ['assignedBy']: item.assignedBy, ['gems']: item.gems, ['verified']: item.verified, ['date']: item.date, ['recievedBy']: item.recievedBy,['recievedDate']:item.recievedDate })
        }
      })
    })
    res.send(tmpArr).status(200)
  } catch (error) {
    res.send(error).status(404)
  }
})

router.post("/wfp/changePass", async (req, res) => {
  const { id, newPass } = req.body;
  try {
    const user = await User.findById(id);
    user.password = newPass;
    user.save();
    res.send("Success").status(200);
  } catch (error) {
    res.send(error).status(500);
  }
});

module.exports = router;
