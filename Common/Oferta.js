class Oferta{
    constructor(nombre, sector, habilidades){
        this.nombre = nombre;
        this.sector = sector;
        this.habilidades = habilidades;
    }
    toJSON(){
        return("{"+
        "\"nombre\":\""+this.nombre + "\","+
        "\"sector\":\""+this.sector + "\","+
        "\"habilidades\":"+JSON.stringify(this.habilidades)+
        "}");
    }
    static fromJSON(json){
        var obj  = JSON.parse(json);
        return new Oferta(obj.nombre,obj.sector,obj.habilidades);
    }
    toString(){
        return(
            "nombre: " + this.nombre+
            "\nsector: " + this.sector+
            "\nhabilidades: " + this.habilidades
        );
    }
}
module.exports = Oferta