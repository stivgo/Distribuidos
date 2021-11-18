class Aspirante{
    constructor(id, sector, habilidades){
        this.id = id;
        this.sector = sector;
        this.habilidades = habilidades;
    }
    static fromJSON(json){
        var obj  = JSON.parse(json);
        return new Aspirante(obj.id,obj.sector,obj.habilidades);
    }
}
module.exports = Aspirante;