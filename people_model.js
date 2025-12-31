const {db_connection} = require("./database_connector")

exports.get = async(data)=>{
    try {
        const resposne = await db_connection.query("SELECT * FROM titanic", null)
        return resposne
      } catch (err) {
        console.log(err.stack)
        return null
      }
}



exports.get_one = async (data) =>{
    try {
        const id = data.params.id;
        const resposne = await db_connection.query('SELECT * FROM titanic WHERE pid=$1', [id])
        return resposne
      } catch (err) {
        console.log(err.stack)
        return null
      }
};


// work on below

exports.save = async (req) =>{
    try {
        // data to insert
        var cols = [req.body.survived, req.body.pclass, req.body.name, req.body.sex, req.body.age, req.body.siblings_spouses_abroad, req.body.parents_children_abroad, req.body.fare, req.params.id];
        const resposne = await db_connection.query('INSERT INTO titanic(survived, pclass, name, sex, age, siblings_spouses_abroad, parents_children_abroad, fare) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', cols)
        return resposne
      } catch (err) {
        console.log(err.stack)
        return null
      }
};

exports.update = async (req) =>{
    try {
        const id = req.params.id;
        var cols = [req.body.survived, req.body.pclass, req.body.name, req.body.sex, req.body.age, req.body.siblings_spouses_abroad, req.body.parents_children_abroad, req.body.fare, req.params.id];
        const resposne = await db_connection.query('UPDATE titanic SET survived=$1, pclass=$2, name=$3, sex=$4, age=$5, siblings_spouses_abroad=$6, parents_children_abroad=$7, fare=$8 WHERE pid=$9', cols)
        return resposne
      } catch (err) {
        console.log(err.stack)
        return null
      }
};

exports.delete = async (req) =>{
    try {
        const id = req.params.id;
        const resposne = await db_connection.query('DELETE FROM titanic WHERE pid=$1', [id])
        return resposne
      } catch (err) {
        console.log(err.stack)
        return null
      }
};