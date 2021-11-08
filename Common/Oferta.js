class Oferta{
    constructor(nombre, sector,...habilidades){
        this.nombre = nombre;
        this.sector = sector;
    }
    static toJSON(){
        return("{"+
        "\"nombre\":\""+this.nombre + "\","+
        "\"sector\":\""+this.sector + "\","
        );
    }
    static fromJSON(json){
        var obj  = JSON.parse(json);
        return new Oferta(obj.nombre,obj.sector);
    }
}
module.exports = Oferta