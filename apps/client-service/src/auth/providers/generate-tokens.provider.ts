import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class GenerateTokensProvider {
    constructor(
        private readonly jwtService : JwtService,
    ){}

    public async signToken<T>(clientId : number, expiresIn : number, payload? : T){
        return await this.jwtService.signAsync({
            sub : clientId,
            ...payload
        }, {
            
        })
    }
}
