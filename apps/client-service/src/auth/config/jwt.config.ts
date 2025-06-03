import { registerAs } from "@nestjs/config";


export default registerAs('jwt', ()=>{
    return {
        secret : process.env.JWT_SECRET,
        audience : process.env.AUDIENCE,
        issuer : process.env.ISSUER,
        accessTokenTtl : 3500,
    }
})